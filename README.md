# edunext-automation
This is a Chrome extension to automate various action on fu.edunext.vn such as auto grade, auto give stars to your group,...

## Installation
- Go to [here](https://github.com/tachibanayui/edunext-automation/actions?query=branch%3Amaster) and select the first entry that have a green tick mark on the left
- Under the artifact setion, click `extension-unpacked`. It will prompt you to download the zip file
- Unzip it into a folder somewhere, you'll need it later

### From this step, the location of buttons might be different, but this guide will mainly focus on Chrome
- Navigate to `chrome://extensions` for Chrome `edge://extensions` for New version of Microsoft Edge and `coccoc://extensions` for Coc Coc 
- Turn on developer node on the top right corner
- Click `Load unpacked` near the top left corner. It will show you a folder picker
- Select the folder you unzip the downloaded file eariler

### Build from source
#### Prerequisites
- Nodejs 16
- NPM 
- Git

1. Clone this repo: 
```git clone https://github.com/tachibanayui/edunext-automation.git```
2. Install NPM packages 
```npm install```
3. Run this command below for development
```npm start```
4. Run this command for a production build
```npm run build```

## Contributing
All contribution are welcome! If you spot a bug, create an new issue [here](https://github.com/tachibanayui/edunext-automation/issues/new). 
If you want to contribute to the codebase, create a fork and open a pull request when you are done. 
It is highly recommended that you open an issue before working on your fork to avoid multiple people writing the same code

## License
This repo is distributed under the MIT License. See `LICENSE.txt` for more information.
