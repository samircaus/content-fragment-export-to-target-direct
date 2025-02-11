/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import React, { useState, useEffect } from 'react'
import { generatePath } from 'react-router'
import { attach } from '@adobe/uix-guest'
import {
  Flex,
  Provider,
  Picker,
  Item,
  Content,
  defaultTheme,
  ButtonGroup,
  Button,
  View,
  Divider
} from '@adobe/react-spectrum'
import { useParams } from 'react-router-dom'
import { triggerExportToAdobeTarget, triggerPublish } from '../utils'
import { extensionId } from './Constants'

const CF_PUBLISH_PROMPT_MESSAGE =
  'The Adobe Target offer may not be displayed correctly if the Content Fragment is not published.<br>Do you also want to publish the Content Fragment?'
const CF_PUBLISH_PROMPT_MESSAGE_MULTIPLE =
  'The Adobe Target offers may not be displayed correctly if the pages are not published.<br>Do you also want to publish the pages?'
const CF_PUBLISH_WARNING = 'Please note that publish will publish the Content Fragment Models and variations as well.'

function publishPromptMessage (multiple) {
  return { __html: multiple ? CF_PUBLISH_PROMPT_MESSAGE_MULTIPLE : CF_PUBLISH_PROMPT_MESSAGE }
}

function publishWarning () {
  return { __html: CF_PUBLISH_WARNING }
}

export default function ExporttoAdobeTargetOffersModal () {
  // Fields
  const [guestConnection, setGuestConnection] = useState()
  const [selectedContentFragments, setSelectedContentFragments] = useState([])
  const [inProgress, setInprogress] = useState(false)

  const { batchId } = useParams()

  useEffect(() => {
    if (!batchId) {
      console.error('batchId parameter is missing')
      return
    }
    const batchData = sessionStorage.getItem(batchId)
    if (!batchData) {
      console.error('Invalid batch specified for exporting')
      return
    }
    try {
      const cfs = JSON.parse(batchData)
      sessionStorage.removeItem(batchId)
      setSelectedContentFragments(cfs)
    } catch (e) {
      console.error(`Invalid batch data: ${e}`)
    }
  }, [batchId])

  useEffect(() => {
    (async () => {
      const guestConnection = await attach({ id: extensionId })
      setGuestConnection(guestConnection)
    })()
  }, [])

  const unpublishedContentFragments = selectedContentFragments.filter(cf => cf.status.toLowerCase() !== 'published')
  const unpublishedContentFragmentsList = unpublishedContentFragments.map(cf => {
    const cfUrl = '/index.html#' + generatePath('/content-fragment/:fragmentId', {
      fragmentId: cf.id.substring(1)
    })
    const openCfHandler = (e) => {
      guestConnection.host.navigation.openEditor(cf.id)
      e.preventDefault()
    }
    return <li key={cf.id}><a href={cfUrl} onClick={openCfHandler}>{cf.title}</a></li>
  })

  const onCloseHandler = () => {
    guestConnection.host.modal.close()
  }

  const onExportWithoutPublishingHandler = async () => {
    setInprogress(true)

    try {
      const auth = await guestConnection.sharedContext.get('auth')
      const token = auth.imsToken
      const imsOrg = auth.imsOrg
      const repo = await guestConnection.sharedContext.get('aemHost')
      const paths = selectedContentFragments.map(el => el.id)
      await triggerExportToAdobeTarget(token, repo, imsOrg, paths)
      await guestConnection.host.toaster.display({
        variant: 'positive',
        message: 'Selected content fragment(s) are successfully scheduled to sync with Adobe Target.'
      })
    } catch (e) {
      console.error('Export to target got an error', e)
      await guestConnection.host.toaster.display({
        variant: 'negative',
        message: 'There was an error while exporting Content Fragment(s)'
      })
    }
    await guestConnection.host.modal.close()
  }

  const onPublishAndExportHandler = async () => {
    setInprogress(true)
    try {
      const auth = await guestConnection.sharedContext.get('auth')
      const token = auth.imsToken
      const imsOrg = auth.imsOrg
      const repo = await guestConnection.sharedContext.get('aemHost')
      const paths = selectedContentFragments.map(el => el.id)
      console.log(`Path: ${paths}`)
      await triggerPublish(token, repo, imsOrg, paths)
      await triggerExportToAdobeTarget(token, repo, imsOrg, paths)
      await guestConnection.host.toaster.display({
        variant: 'positive',
        message: 'Selected content fragment(s) are successfully scheduled to be published and synced with Adobe Target.'
      })
    } catch (e) {
      console.error('Export to target got an error', e)
      await guestConnection.host.toaster.display({
        variant: 'negative',
        message: 'There was an error while publishing and exporting Content Fragment(s)'
      })
    }
    await guestConnection.host.modal.close()
  }

  if (inProgress) {
    return (
      <Provider theme={defaultTheme} colorScheme='light'>
        <Content width="100%">
          <View>
            Processing...
          </View>
        </Content>
      </Provider>
    )
  }

  return (
    <Provider theme={defaultTheme} colorScheme='light'>
      <Content width="100%">
      <Picker label="Select Workspace">
          <Item key="0">Default Workspace</Item>
          <Item key="sometimes">My Workspace</Item>
          <Item key="always">Hidden Workspace</Item>
        </Picker>
        <Divider size="S" marginTop="size-300" marginBottom="size-300"/>
        <View>
          <div dangerouslySetInnerHTML={publishPromptMessage(selectedContentFragments.length > 1)}/>
        </View>
        <Divider size="S" marginTop="size-300" marginBottom="size-300"/>
        <View>
          {unpublishedContentFragmentsList.length > 1 ? 'The following content fragments are not published:' : 'The following content fragment is not published:'}
          <ul>
            {unpublishedContentFragmentsList.map((item) => (
                <div>
                    {item}
                </div>
            ))}
          </ul>
        </View>
        <Divider size="S" marginTop="size-300" marginBottom="size-300"/>
        <View UNSAFE_style={{ fontWeight: 'bold' }}>
          <div dangerouslySetInnerHTML={publishWarning()}/>
        </View>

        <Flex width="100%" justifyContent="end" alignItems="center" marginTop="size-400">
          <ButtonGroup align="end">
            <Button variant="primary" onClick={onCloseHandler}>Cancel</Button>
            <Button variant="primary" onClick={onExportWithoutPublishingHandler}>Export (no publishing)</Button>
            <Button variant="accent" onClick={onPublishAndExportHandler}>Publish and Export</Button>
          </ButtonGroup>
        </Flex>
      </Content>
    </Provider>
  )
}
