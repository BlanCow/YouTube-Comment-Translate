<p align="center"><img src="docs/icon.png"></p>
<h1 align="center">YouTube-Comment-Translate</h1>
<h3 align="center">(Firefox and Chrome)</h3>

<p align="center">
	</br></br>
		<a href="https://addons.mozilla.org/en-US/firefox/addon/youtube-comment-translate/">
			<img src="docs/get-the-addon.png">
		<a href="#">
			<img src="docs/ChromeWebStore_BadgeWBorder_v2_206x58.png">
	</br></br>
</p>

<!-- vim-markdown-toc GFM -->

- [Usage](#usage)
  - [Changing the language](#changing-the-language)
- [Installation](#installation)
- [Build](#build)

<!-- vim-markdown-toc -->

## Usage

After installing, this icon will appear next to every comment</br>
<img src="docs/usage_firefox.gif">

### Changing the language

The default target language is your browser language. To change it, click in the top right corner of firefox on the extension icon:

<img src="docs/change_language_1.png">

and select a new target language by clicking on the dropdown:

<img src="docs/change_language_2.png">

The changes are applied instantly so no need to refresh the youtube page

## Installation

Simply download the extension from https://addons.mozilla.org/en-US/firefox/addon/youtube-comment-translate/ for Firefox or from [COMING SOON] for Chrome.

## Build

For developers who want to fork my project, after making a change, you must build the extension for the browser of your choice (currently only firefox and chrome) with the following command:
`powershell ./build-extention.ps1 {{ BROWSER_NAME }}` (Windows 10+ is required)

The command minifies inject.js, create a different manifest.json file depending on the browser and generates a zip file and folder containing the extension data that you can upload to the browser.

<br>
The icons used in the README are from the open-source [papirus-icon-theme](https://github.com/PapirusDevelopmentTeam/papirus-icon-theme) project
