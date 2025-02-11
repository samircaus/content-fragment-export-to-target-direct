# Disclaimer

This is a Work in Progress Extension!

# CFtoAdobeTargetDirect

This extension uses [UI Extension SDK](https://developer.adobe.com/uix/docs/) to create a custom UI for Content Fragment Core Component.
It allows the user to select a content fragment and export it to Adobe Target. It is a copy of following [Extension](https://github.com/adobe/aem-uix-examples/blob/main/content-fragment-export-to-target/src/aem-cf-console-admin-1/actions/export/index.js) with following changes:

  * It relies on [Adobe Target Admin API](https://developer.adobe.com/target/administer/admin-api/#tag/Offers/operation/createOffer_1_1) to create, update or delete offers in Adobe Target. This gives advantages like Workspace support, Target offers can be modified also in Target UI and Target offers will have same content as CF (without added GRaphQL metadata)
  * Workspace selection. Unfortunatelly, there is no [List Workspace API](https://experienceleaguecommunities.adobe.com/t5/adobe-target-ideas/workspace-list-api-to-get-the-names-of-all-workspaces/idi-p/676644) so Workspaces should be pre-configured


## Pre-requisites
1. [Set up](https://github.com/adobe/aem-uix-examples/wiki/Exporting-Content-Fragments-to-Adobe-Target#aem-instance-setup) your AEM instance.
2. Make sure that you have [installed aio cli tool](https://developer.adobe.com/uix/docs/guides/local-environment/#manage-aio-cli-tool)
3.  [Create a project](https://developer.adobe.com/uix/docs/guides/creating-project-in-dev-console/) in Adobe Developer Console or use existing one.
## Local Dev

1. Sign in to **aio cli** using `aio login` command.
2. Run `aio app use` command to generate `.env` file.
3. `aio app run` to start your local Dev server
4. App will run on `localhost:9080` by default

Some other usefule commands:
* `aio rt:action:list`
* `aio rt:action:get aem-cf-console-admin-1/export --url`
* `aio rt:action:invoke aem-cf-console-admin-1/export --param tenant "tepshared" --result`
* `aio app logs -w`
* `aio app deploy --no-actions`
* `aio rt:action:invoke aem-cf-console-admin-1/export --param-file default-params.json`

See [packages](https://developer.adobe.com/runtime/docs/guides/using/creating_actions/)


Now you can preview your app in the browser: `https://experience.adobe.com/?repo=<CURTOMER_AEM_HOST>#/@<CUSTOMER_IMS_ORG>/aem/cf/admin/`
See this [doc](https://developer.adobe.com/uix/docs/guides/preview-extension-locally/) for step by step instructions.


By default the UI will be served locally but actions will be deployed and served from Adobe I/O Runtime. To start a
local serverless stack and also run your actions locally use the `aio app run --local` option.

## Test & Coverage

- Run `aio app test` to run unit tests for ui and actions
- Run `aio app test --e2e` to run e2e tests

## Deploy & Cleanup

- `aio app deploy` to build and deploy all actions on Runtime and static files to CDN
- `aio app undeploy` to undeploy the app


### `app.config.yaml`

- Main configuration file that defines an application's implementation.
- More information on this file, application configuration, and extension configuration
  can be found [here](https://developer.adobe.com/app-builder/docs/guides/appbuilder-configuration/#appconfigyaml)


## Debugging in VS Code

While running your local server (`aio app run`), both UI and actions can be debugged, to do so open the vscode debugger
and select the debugging configuration called `WebAndActions`.
Alternatively, there are also debug configs for only UI and each separate action.

## User Guide

Original extension : https://github.com/adobe/aem-uix-examples/wiki/Exporting-Content-Fragments-to-Adobe-Target 