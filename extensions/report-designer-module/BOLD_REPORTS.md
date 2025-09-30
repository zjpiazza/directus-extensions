Embedded

|     |     |     |
| --- | --- | --- |
| |     |     |
| --- | --- |
|  | × | | search |  |

[Schedule Free Demo](https://www.boldreports.com/schedule-free-demo)

[Try it Free](https://app.boldid.net/register/reports/enterprise?evaluation=v2&leadsource=www.boldreports.com&gclid=&referrerroriginurl=https://help.boldreports.com/&secondaryreferraloriginurl=https://help.boldreports.com/&host=server&quantity=1)

Overview

Installation

Licensing

Blazor Reporting

Angular Reporting

JavaScript Reporting

- [Overview](https://help.boldreports.com/embedded-reporting/javascript-reporting/overview/)

- [System Requirements](https://help.boldreports.com/embedded-reporting/javascript-reporting/system-requirements/)

- [Report Viewer](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-viewer/)

- [Report Designer](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/)

  - [Getting Started](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/add-web-report-designer-to-a-javascript-application/)

  - [Dependencies](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/dependencies/)

  - [ReportServer Integration](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/server-integration/)

  - [Localization](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/localization/)

  - [Handle Post Actions](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/handle-post-actions/)

  - [Designer Guide](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/designer-guide/)

  - [Samples and Demos](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/samples-and-demos/)

  - [Migrate to latest version](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/migration/)

  - [NuGet packages](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/nuget-packages/)

  - [Responsive Layout](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/responsive-layout/)

  - [Browser Compatibility](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/browser-compatibility/)

  - [Accessibility](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/accessibility/)

  - [Report Service](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/report-service/)

  - [FAQ](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/faq/)

    - [How to Add Web Report Designer to a Vue application?](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/faq/add-web-report-designer-to-a-vue-application/)

    - [Customize the Report Designer Toolbar](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/faq/customize-the-report-designer-toolbar/)

    - [Add new item to the Report Designer Toolbar](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/faq/add-new-item-in-report-designer-toolbar/)

    - [List out specific data connectors in data panel](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/faq/list-out-specific-data-connectors-in-data-panel/)
  - [How To](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/how-to/)

  - [Breaking Changes](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/breaking-changes/)

  - [API Reference](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/api-reference/)

React Reporting

ASP.NET Core Reporting

ASP.NET MVC Reporting

ASP.NET Web Forms Reporting

WPF Reporting

UWP Reporting

Converter Utility

Class Reference

How To

FAQ

Theme Studio

/

[JavaScript Reporting](https://help.boldreports.com/embedded-reporting/javascript-reporting/)

/

How to Add Web Report Designer to a Vue application?

Search results

[Suggest a Feature](https://www.boldreports.com/feedback "Suggest a Feature") [PDF](https://help.boldreports.com/embedded-reporting/boldreports-embedded-reporting.zip "Download PDF")

# How to Add Web Report Designer to a Vue application

30 Sep 2025 / 4 minutes to read

This section explains the steps required to Add web Report Designer to a Vue application.

## Prerequisites [prerequisites permalink](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/faq/add-web-report-designer-to-a-vue-application/\#prerequisites)

Before getting started with the bold report designer, make sure that your development environment includes the following commands.

- [Node JS](https://nodejs.org/en/) ( `version 8.x or 10.x` )
- [NPM](https://docs.npmjs.com/getting-started/installing-node#install-npm--manage-npm-versions) (v3.x.x or higher)

## Install the Vue CLI [install the vue cli permalink](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/faq/add-web-report-designer-to-a-vue-application/\#install-the-vue-cli)

Vue provides the easiest way to set Vue CLI projects using the [Vue CLI](https://cli.vuejs.org/guide/installation.html) tool. To install the CLI application globally to your machine, run the following command in the Command Prompt.

```typescript
 npm install -g @vue/cli
```

## Create a new Vue application [create a new vue application permalink](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/faq/add-web-report-designer-to-a-vue-application/\#create-a-new-vue-application)

To create a new Vue application, run the following command in Command Prompt.

```typescript
 vue create project-name

 E.g : vue create report-designer-app
```

> The [vue create](https://cli.vuejs.org/guide/creating-a-project.html) command prompts you for information about features to include in the initial app project. Accept the defaults by pressing the Enter.

## Configure Bold Report Designer in Vue CLI [configure bold report designer in vue cli permalink](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/faq/add-web-report-designer-to-a-vue-application/\#configure-bold-report-designer-in-vue-cli)

To configure the Report Designer component, change the directory to your application’s root folder.

```typescript
 cd project-name

 E.g : cd report-designer-app
```

Run the following commands to install the Bold Reporting packages are distributed in npm as [@boldreports/javascript-reporting-controls](https://www.npmjs.com/package/@boldreports/javascript-reporting-controls).

```typescript
npm install @boldreports/javascript-reporting-controls
```

## Adding Report Designer component [adding report designer component permalink](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/faq/add-web-report-designer-to-a-vue-application/\#adding-report-designer-component)

Hence create a file named ‘ReportDesigner.vue’ inside the src folder

```js
<template>
  <div id="designer"></div>
</template>

<script>
import $ from 'jquery';
export default {
  name: 'ReportDesigner',
  mounted()
  {
    $("#designer").boldReportDesigner({
        serviceUrl: "https://demos.boldreports.com/services/api/ReportingAPI"
    });
  }
}
</script>
```

## Adding scripts reference [adding scripts reference permalink](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/faq/add-web-report-designer-to-a-vue-application/\#adding-scripts-reference)

Bold Reports® needs ‘window.jQuery’ object to render the Vue components. Hence create a file named ‘globals.js’ inside the src folder and import jQuery in ‘globals.js’ file as like the below code snippet.

```js
import jquery from 'jquery';

window['jQuery'] = jquery;

window['$'] = jquery;
```

Refer the `globals.js` file in `main.js` file as like below code snippet.
The Bold Report Designer script and style files need to be imported, in order to run the web Report Designer.

```js
import './globals'
import Vue from 'vue'
import ReportDesigner from './ReportDesigner.vue'
//Report designer dependent scripts
import '@boldreports/javascript-reporting-controls/Scripts/v2.0/common/bold.reports.common.min.js'
import '@boldreports/javascript-reporting-controls/Scripts/v2.0/common/bold.reports.widgets.min.js'
//Report designer source
import '@boldreports/javascript-reporting-controls/Scripts/v2.0/bold.report-designer.min';
import '@boldreports/javascript-reporting-controls/Scripts/v2.0/bold.report-viewer.min';

Vue.config.productionTip = false

new Vue({
  render:h => h(ReportDesigner),
}).$mount('#designer')
```

Hence create a file named ‘style.css’ inside the public folder

```css
html {
    height: 100%;
}

body {
    height: 100%;
    margin: 0;
    width: 100%;
    overflow: hidden;
}

ej-sample,
ej-reportdesigner {
    display: block;
    height: inherit;
    width: inherit;
}

.splash {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translateY(-50%) translateX(-50%);
}

.message {
    text-align: center;
    font-size: 40px;
    margin-bottom: 20px;
}

.loader {
    margin: auto;
    width: 70px;
    text-align: center;
    position: relative;
}

.loader>div {
    width: 18px;
    height: 18px;
    background-color: black;
    border-radius: 100%;
    display: inline-block;
    -webkit-animation: sk-bouncedelay 1.4s infinite ease-in-out both;
    animation: sk-bouncedelay 1.4s infinite ease-in-out both;
}

.loader .bounce1 {
    -webkit-animation-delay: -0.32s;
    animation-delay: -0.32s;
}

.loader .bounce2 {
    -webkit-animation-delay: -0.16s;
    animation-delay: -0.16s;
}

@-webkit-keyframes sk-bouncedelay {

    0%,
    80%,
    100% {
        -webkit-transform: scale(0);
    }

    40% {
        -webkit-transform: scale(1);
    }
}

@keyframes sk-bouncedelay {

    0%,
    80%,
    100% {
        -webkit-transform: scale(0);
        transform: scale(0);
    }

    40% {
        -webkit-transform: scale(1);
        transform: scale(1);
    }
}
```

Open the ‘public\\index.html’ and refer the following links and scripts in < head> tag.

```html
<link href="style.css" rel="stylesheet">
<link href="https://cdn.boldreports.com/11.1.10/content/v2.0/tailwind-light/bold.report-designer.min.css" rel="stylesheet" />
```

Add the following code in the <body> tag.

```html
<div class="splash">
      <div class="message">Vue.js Reports</div>
      <div class="loader">
          <div class="bounce1"></div>
          <div class="bounce2"></div>
          <div class="bounce3"></div>
      </div>
</div>
<div id="designer"></div>
<!-- built files will be auto injected -->
<script>
    document.addEventListener('DOMContentLoaded', function () {
        document.getElementsByClassName("splash")[0].style.display = "None";
    });
</script>
```

## Run the Application [run the application permalink](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/faq/add-web-report-designer-to-a-vue-application/\#run-the-application)

To run the application, run the following command in command prompt.

```typescript
npm run serve
```

[How to Add Web Report Viewer to a Vue application](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-viewer/faq/add-web-report-viewer-to-a-vue-application/)

CONTENTS

- [Prerequisites](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/faq/add-web-report-designer-to-a-vue-application/#prerequisites)
- [Install the Vue CLI](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/faq/add-web-report-designer-to-a-vue-application/#install-the-vue-cli)
- [Create a new Vue application](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/faq/add-web-report-designer-to-a-vue-application/#create-a-new-vue-application)
- [Configure Bold Report Designer in Vue CLI](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/faq/add-web-report-designer-to-a-vue-application/#configure-bold-report-designer-in-vue-cli)
- [Adding Report Designer component](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/faq/add-web-report-designer-to-a-vue-application/#adding-report-designer-component)
- [Adding scripts reference](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/faq/add-web-report-designer-to-a-vue-application/#adding-scripts-reference)
- [Run the Application](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/faq/add-web-report-designer-to-a-vue-application/#run-the-application)

Having trouble getting help?

[Contact Support](https://support.boldreports.com/)

CONTENTS

- [Prerequisites](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/faq/add-web-report-designer-to-a-vue-application/#prerequisites)
- [Install the Vue CLI](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/faq/add-web-report-designer-to-a-vue-application/#install-the-vue-cli)
- [Create a new Vue application](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/faq/add-web-report-designer-to-a-vue-application/#create-a-new-vue-application)
- [Configure Bold Report Designer in Vue CLI](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/faq/add-web-report-designer-to-a-vue-application/#configure-bold-report-designer-in-vue-cli)
- [Adding Report Designer component](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/faq/add-web-report-designer-to-a-vue-application/#adding-report-designer-component)
- [Adding scripts reference](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/faq/add-web-report-designer-to-a-vue-application/#adding-scripts-reference)
- [Run the Application](https://help.boldreports.com/embedded-reporting/javascript-reporting/report-designer/faq/add-web-report-designer-to-a-vue-application/#run-the-application)

Having trouble getting help?

[Contact Support](https://support.boldreports.com/)

Custom Search

|     |     |
| --- | --- |
|  | Sort by:<br>Relevance<br>Relevance<br>Date |

Was this page helpful?

No

Yes

[Copyright © 2001 -  2025 Syncfusion Inc. All Rights Reserved](http://www.syncfusion.com/copyright)

[Follow Syncfusion on Facebook](https://www.facebook.com/boldreportsofficial/ "Follow Syncfusion on Facebook")[Follow Syncfusion on Twitter](https://twitter.com/boldreportsoffl "Follow Syncfusion on Twitter")[Follow Syncfusion on LinkedIn](https://www.linkedin.com/showcase/boldreportsofficial "Follow Syncfusion on LinkedIn")[Follow Syncfusion on Mail](mailto:support@boldreports.com? "Follow Syncfusion on Mail")

HELP US TO IMPROVE THIS PAGE

Correct inaccurate or outdated content

Please provide additional information

Improve illustrations or images

Please provide additional information

Fix typos or broken links

Please provide additional information

Add more information

Please provide additional information

Correct inaccurate or outdated code samples

Please provide additional information

Other

Please provide additional information

I agree to the creation of a Syncfusion account in my name and to be contacted regarding this message. No further action will be taken. Please see our [Privacy policy.](https://www.syncfusion.com/privacy)

Thank you for your feedback and comments.We will rectify this as soon as possible!

SUBMITCANCEL

![helpbot icon](https://cdn.syncfusion.com/helpbot/staging/images/ai_start_new_page.svg)
Bold Reports HelpBot

|     |     |
| --- | --- |
|  |  |
