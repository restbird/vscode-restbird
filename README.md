# Restbird Debugger

## Debug your [Restbird](https://restbird.org) test script from VS Code.

Restbird Debugger extension allows you to debug test scripts (written in GoLang, Python and Javascript) for [Restbird](https://restbird.org) project in vscode directly. 

>By simply right click and choose "Restbird: Debug Restbird script"

 ![Running Debug](/images/DebugRestGo.gif)

>You also get the side befefit of Syntax check VSCode offered

![GoLang Synxtax Check](/images/SyntaxCheckGo.gif)
## Supported platform and language
### Linux 
* GoLang (go version go1.10.2 linux/amd64)
* Python (python3)
* Javascript
### MacOS
* Python (python3)
* Javascript

## Requirements

### Restbird V3.1 and upper version is runnning locally

  * First, pull the restbird docker image from the docker hub.
    > docker pull restbird/rest

  * Second, start a restbird container.
    > docker run -ti -p {host-port}:8080 -v {path-to-project}:/data/restbird restbird/rest

    Alternatively, if you want to use mock server, a range of ports need to be reserved when starting restbird in 2nd step.
    >  docker run -ti -p {host-port}:8080 -p 8000-8010:8000-8010 -v {path-to-project}:/data/restbird restbird/rest

### Install debug environment for particular language
> Note: You don't need to install all envinronment, just the specific language you used to develop your test script
#### GoLang
* Install Golang version 1.10.4

  For the reason that Restbird is compiled with Go version 1.10.4, so in the initial release we'll only support debugging with the same Golang version.

  We will support other Go versions later

  [Download the archieve](https://golang.org/doc/install?download=go1.10.2.linux-amd64.tar.gz) and extract it into /usr/local, creating a Go tree in /usr/local/go. For example: 
  > tar -C /usr/local -xzf go1.10.2.linux-amd64.tar.gz
 
* Setup GoPath in VSCode

  After run debug, Restbird will generate debug files (main.go and related libs in Restbird project directory (a "sanbox" directory will be created) of your local filesystem)

  ```
    {
        "go.gopath" : "[Your Restbird project directory]/sandbox/tmp:[Your Restbird project directory]/sandbox/tmp/src/restbirdlib",
    }  
   ``` 
  ![Setup GoPath](/images/SettingGoPath.gif)
* Install [Delve debugger](https://github.com/derekparker/delve) for Debugging GoLang
  
  And ensure it is in your "GOPATH/bin" or "PATH".

* Configure debug in VSCode: Sample Debug Configuration (launch.json)
  ```
    {
        "name": "Launch Go",
        "type": "go",
        "request": "launch",
        "mode": "auto",
        "program": "${fileDirname}",
        "host": "127.0.0.1",
        "port": 2345,
        "env": {},
        "args": []
    }
    ```
   ![Setup Debug Configuration](/images/settingdebug.gif)

* Open the Go file you want to debug and right click then chooe "Restbird: Debug Restbird script"
  
  main.go will be generated under [your Restbird project directory]/sandbox/tmp/src/restbird-[rest/mock/task]
  
  click Debug to start debugging
  
#### Python
* Ensure [Python 3](https://www.python.org/downloads/) has been installed in your system.
* Install [Request](http://docs.python-requests.org/en/master/user/install/#install) lib

  Below command has been tested in ubuntu 16.04
````
    apt-get install python3
    apt-get install python3-pip
    pip3 install --user pipenv
    pip3 install requests
````

* Setup pythonPath in VSCode to use python3 

```
    {
        "python.pythonPath": "Path to your python3, e.g. /usr/bin/python3"
    }
```
* Configure debug in VSCode: Sample Debug Configuration (launch.json)
```
    {
        "name": "Python: Current File",
        "type": "python",
        "request": "launch",
        "program": "${file}",
    }
````
  ![config python debug](/images/SettingPythonDbg.gif)

> Restbird also support to use pipenv, Pipfile is shiped with debug package inside [Your path to Restbird project]/sandbox/tmp/ directory when you Run debug of Python script

* pipenv install
* pipenv --venv
![run pipenv](/images/Pipenv.gif)
  To get the virtal env path
* Setup pythonPath in VSCode to use python3 

```
    {
        "python.pythonPath": "Path to your virtaul env, e.g. /User/restbird/.local/share/virtualenvs/restbird-BKBCD7Kk"
    }
```  
  ![set pythonPath](/images/SettingPythonPath.gif)
  
#### Javascript
* Ensure [Node.js](https://nodejs.org/en/) has been installed in your system

* Configure debug in VSCode: Sample Debug Configuration (launch.json)
```
     {
        "type": "node",
        "request": "launch",
        "name": "Launch JS",
        "program": "${fileDirname}/restbird-mock.js",
        "runtimeExecutable": "/usr/local/node-v8.9.4-linux-x64/bin//node",
     },
````
  > Restbird only support using Javasript in mock server
## Extension Settings

* `global.serverPort`: The port Restbird docker server listens to.
* `credential.username`: The username of Restbird user
* `credential.password`: The password of Restbird user

## Tips
* For Debbuging mockserver, it is required to set the mock server port to use the port that hasn’t been mapped into docker, or mock server will not be able to start due to port already been used.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of Restbird Debugger

**Enjoy!**
