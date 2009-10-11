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


# copy common files 
copy_common_package_files()
{
  mkdir -p xpi/chrome/content
  mkdir -p xpi/chrome/data
  cp ../chrome.manifest.real xpi/chrome.manifest
  cp ../install.rdf xpi/
  cp -r ../content/fireinput xpi/chrome/content
  cp -r ../locale xpi/chrome/
  cp -r ../skin xpi/chrome/
  cp -r ../platform xpi/
  cp  ../data/pinyin_transform  xpi/chrome/data
}

create_platform_style()
{
  platforms='Darwin  Linux  SunOS  WINNT'
  for platform in $platforms 
  do 
     # zip files 
     (cd xpi/platform/$platform/; zip -r fireinput.jar skin; rm -rf skin; mv fireinput.jar chrome/); 
     (cd xpi/platform/$platform/; mv chrome.manifest.real chrome.manifest); 
  done 
}
 
# copy the necessary files into xpi directory 
copy_small_package()
{
  copy_common_package_files
  cp  ../data/smart_pinyin_phrase  xpi/chrome/data
  cp  ../data/smart_pinyin_table  xpi/chrome/data
}

copy_large_package()
{
  copy_common_package_files
  cp ../update/install.large.rdf xpi/install.rdf
  cp  ../data/smart_pinyin_phrase.large  xpi/chrome/data/smart_pinyin_phrase
  cp  ../data/smart_pinyin_table  xpi/chrome/data
  cp  ../data/wubi86_table  xpi/chrome/data
  cp  ../data/wubi98_table  xpi/chrome/data
  cp  ../data/cangjie5_table  xpi/chrome/data
}

# copy the necessary files into xpi directory 
copy_wubi_package()
{
  copy_common_package_files
  cp ../update/install.wubi.rdf xpi/install.rdf
  cp  ../data/wubi86_table  xpi/chrome/data
  cp  ../data/wubi98_table  xpi/chrome/data
}

copy_cangjie5_package()
{
  copy_common_package_files
  cp ../update/install.wubi.rdf xpi/install.rdf
  cp  ../data/cangjie5_table  xpi/chrome/data
}

create_package()
{
  package_name=$1

  # remove .svn 
  rm -rf `find ./* -name '.svn' `

  # jsmint editor.html 
  # files=`find ./* -iname '*.js' -or -iname '*.html'`
  #for file in $files 
  #do 
  #   python ../../tools/jsmin.py < $file > /tmp/fireinput_package_tmp
  #   cp -f /tmp/fireinput_package_tmp $file
  #done

  # create platform style css 
  create_platform_style

  # zip files 
  (cd xpi/chrome/; zip -r fireinput.jar content locale skin); 

  # remove files part of jar 
  rm -rf xpi/chrome/content; 
  rm -rf xpi/chrome/locale; 
  rm -rf xpi/chrome/skin; 

  # create xpi 
  (cd xpi; zip -r $package_name chrome.manifest install.rdf platform chrome/data chrome/fireinput.jar); 
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

update_buildate()
{
  version=$1
  files='xpi/chrome/content/fireinput/about.html'

  for file in $files 
  do 
     sed "s/%FIREINPUT_BUILDATE%/$version/g" $file > $file.new
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

if [ $# -ne 2 ]; then
   fail "Must specify $0 <package version> <build date, 2009-01-01>"
fi 

package_version=$1
package_buildate=$2

# create small package 
init
copy_small_package
update_version ${package_version}
update_buildate ${package_buildate}
create_package "fireinput-${package_version}.xpi"
generate_update_rdf "update.rdf" ${package_version}
clean

# create large package 
copy_large_package
update_version "${package_version}l"
update_buildate ${package_buildate}
create_package "fireinput-${package_version}l.xpi"
generate_update_rdf "update.large.rdf" "${package_version}l"
clean

# create wubi package 
copy_wubi_package
update_version "${package_version}wubi"
update_buildate ${package_buildate}
create_package "fireinput-${package_version}wubi.xpi"
generate_update_rdf "update.wubi.rdf" "${package_version}wubi"
clean

# create cangjie5 package 
copy_cangjie5_package
update_version "${package_version}cangjie5"
update_buildate ${package_buildate}
create_package "fireinput-${package_version}cangjie5.xpi"
generate_update_rdf "update.cangjie5.rdf" "${package_version}cangjie5"
clean

exit 0
