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
const fetch = require('node-fetch')
const { Core } = require('@adobe/aio-sdk')
const { errorResponse, stringParameters, checkMissingRequestInputs, getTargetAuthHeaders } = require('../utils')

// main function that will be executed by Adobe I/O Runtime
async function main (params) {
  // create a Logger
  const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' })

  try {
    // 'info' is the default level if not set
    logger.info('Calling the main action')

    // log parameters, only if params.LOG_LEVEL === 'debug'
    logger.debug(stringParameters(params))

    // check for missing request input parameters and headers
    const requiredParams = [/* add required params */]
    const requiredHeaders = ['Authorization']
    const errorMessage = checkMissingRequestInputs(params, requiredParams, requiredHeaders)
    if (errorMessage) {
      // return and log client errors
      return errorResponse(400, errorMessage, logger)
    }

    const headers = await getTargetAuthHeaders(params)

    const exportResponse = await fetch(`https://mc.adobe.io/${params.tenant}/target/offers/json`, {
      headers: {
        ...headers,
        'Content-Type': 'application/vnd.adobe.target.v2+json' 
      },
      method: 'POST',
      body: JSON.stringify({
        name: "CF offer name",
        content: {"content": "The content of the offer"},
        workspace: "751852935"
      }),
      headers,
      method: 'POST'
    })

    logger.info(` Export response status text ${exportResponse.statusText}`)
    if (!exportResponse.ok) {
      throw new Error(`request to https://mc.adobe.io/${params.tenant}/target/offers/json failed with status code ` + exportResponse.status + JSON.stringify(exportResponse))
    }

    logger.info(`${exportResponse.status}: successful export request`)
    return {
      statusCode: 200,
      body: '{}'
    }
  } catch (error) {
    // log any server errors
    logger.error(error)
    // return with 500
    return errorResponse(500, `Server error: ${error}`, logger)
  }
}

exports.main = main
