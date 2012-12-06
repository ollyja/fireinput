火输(Fireinput)
===============
Fireinput provides Firefox add-on to have Chinese input for all editable HTML fields. It has most of functionalities of traditional desktop input software, but with the intelligence of interacting with users.

Installation
-------------
https://addons.mozilla.org/en-US/firefox/addon/fireinput/

Setup development environment 
-------------------------------------
1. create dev profile and enable options based on this link: 
   https://developer.mozilla.org/en-US/docs/Setting_up_extension_development_environment

2. additionally, enable this option: extensions.logging.enabled to be true

3. download or clone fireinput code
   git clone https://github.com/ollyja/fireinput.git

4. create extension 
   - cd  .mozilla/<firefox profile name.dev>/
   - mkdir extensions 
   - vi fireinput@software.fireinput.com
   - add one line in above file: /home/<you username>/<where is fireinput checkout>/, such as /home/dang/project/fireinput/

5. create components 
   - cd /home/<you username>/<where is fireinput checkout>/
   - mkdir components
   - cp components.src/nsIFireinput.xpt components/
   - cp components.src/fireinputService.js components/
 
6. start firefox: 
   firefox -no-remote -P dev 

www.fireinput.com
------------------
Visit http://www.fireinput.com for screenshots and other details 
