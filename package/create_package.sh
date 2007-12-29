#clean and create directory 
init()
{

  rm -f *.xpi 
  rm -rf xpi
}

fail()
{
        if [ -n "$*" ]; then
                echo >&2 "$*"
        fi
        exit 1
}


# copy the necessary files into xpi directory 
copy_small_package()
{
  mkdir -p xpi/chrome/content
  mkdir -p xpi/chrome/data
  cp ../chrome.manifest.real xpi/chrome.manifest
  cp ../install.rdf xpi/ 
  cp -r ../content/fireinput xpi/chrome/content
  cp -r ../locale xpi/chrome/
  cp -r ../skin xpi/chrome/
  cp  ../data/smart_pinyin_phrase  xpi/chrome/data
  cp  ../data/smart_pinyin_table  xpi/chrome/data
  cp  ../data/pinyin_transform  xpi/chrome/data
}

copy_large_package()
{
  mkdir -p xpi/chrome/content
  mkdir -p xpi/chrome/data
  cp ../chrome.manifest.real xpi/chrome.manifest
  cp ../update/install.large.rdf xpi/install.rdf
  cp -r ../content/fireinput xpi/chrome/content
  cp -r ../locale xpi/chrome/
  cp -r ../skin xpi/chrome/
  cp  ../data/smart_pinyin_phrase.large  xpi/chrome/data/smart_pinyin_phrase
  cp  ../data/smart_pinyin_table  xpi/chrome/data
  cp  ../data/pinyin_transform  xpi/chrome/data
  cp  ../data/wubi86_table  xpi/chrome/data
  cp  ../data/wubi98_table  xpi/chrome/data
}

# copy the necessary files into xpi directory 
copy_wubi_package()
{
  mkdir -p xpi/chrome/content
  mkdir -p xpi/chrome/data
  cp ../chrome.manifest.real xpi/chrome.manifest
  cp ../update/install.wubi.rdf xpi/install.rdf
  cp -r ../content/fireinput xpi/chrome/content
  cp -r ../locale xpi/chrome/
  cp -r ../skin xpi/chrome/
  cp  ../data/pinyin_transform  xpi/chrome/data
  cp  ../data/wubi86_table  xpi/chrome/data
  cp  ../data/wubi98_table  xpi/chrome/data
}

create_package()
{
  package_name=$1

  # remove .svn 
  rm -rf `find ./* -name '.svn' `

  # zip files 
  (cd xpi/chrome/; zip -r fireinput.jar content locale skin); 

  # remove files part of jar 
  rm -rf xpi/chrome/content; 
  rm -rf xpi/chrome/locale; 
  rm -rf xpi/chrome/skin; 

  # create xpi 
  (cd xpi; zip -r $package_name chrome.manifest install.rdf chrome/data chrome/fireinput.jar); 
  cp xpi/$package_name . 
}

update_version()
{
  version=$1
  files='xpi/install.rdf xpi/chrome/content/fireinput/version.js xpi/chrome/content/fireinput/about.html'

  for file in $files 
  do 
     sed "s/%FIREINPUT_VERSION%/$version/g" $file > $file.new
     mv $file.new $file
  done 
}

generate_update_rdf()
{
  file=$1
  version=$2
  
  cp ../update/update.rdf $file 
  sed "s/%FIREINPUT_VERSION%/$version/g" $file > $file.new
  mv $file.new $file
}

clean()
{
  # remove all other files part of xpi 
  rm -rf xpi
}

if [ $# -ne 1 ]; then
   fail "Must specify package version: $0 0.9"
fi 

package_version=$1

# create small package 
init
copy_small_package
update_version ${package_version}
create_package "fireinput-${package_version}.xpi"
generate_update_rdf "update.rdf" ${package_version}
clean

# create large package 
copy_large_package
update_version "${package_version}l"
create_package "fireinput-${package_version}l.xpi"
generate_update_rdf "update.large.rdf" "${package_version}l"
clean

# create large package 
copy_wubi_package
update_version "${package_version}wubi"
create_package "fireinput-${package_version}wubi.xpi"
generate_update_rdf "update.wubi.rdf" "${package_version}wubi"
clean

exit 0
