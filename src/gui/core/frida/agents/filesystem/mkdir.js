module.exports = function(apath, recursive){
    recursive = recursive ? recursive : false;
    return new Promise(function (resolve, reject) {
        if (ObjC.available) {
            // Classes needed
            var NSFileManager = ObjC.classes.NSFileManager;
            var NSString = ObjC.classes.NSString;

            // get a file manager instance to work with
            var fm = NSFileManager.defaultManager();

            // init the path and data to write
            var destination = NSString.stringWithString_(apath);

            if (fm.createDirectoryAtPath_withIntermediateDirectories_attributes_error_(destination, recursive, NULL, NULL)){
                resolve('ok')
            } else {
                reject('is not renovable')
            }
        } else if (Java.available) {
            Java.perform(function () {
                // Uploads a file to the remote Android devices filesystem.
                // The file contents itself is a base64 encoded string. This might
                // not be the best implementation from a performance perspective.

                var File = Java.use('java.io.File');
                var FileOutputStream = Java.use('java.io.FileOutputStream');
                var Base64 = Java.use('android.util.Base64');

                var file = File.$new('{{ destination }}');
                var decoded_bytes = Base64.decode('{{ base64_data }}', 0);

                // check that the file exists, else create it
                if (!file.exists()) {

                    file.createNewFile();
                }

                // Write the data!
                var fos = FileOutputStream.$new(file.getAbsolutePath());
                fos.write(decoded_bytes, 0, decoded_bytes.length);
                fos.close();

                var response = {
                    status: 'success',
                    error_reason: NaN,
                    type: 'file-upload',
                    data: 'File written to: ' + file.getAbsolutePath()
                };

                // send the response message
                send(response);
            })
        } else {
            reject(new Error('Language not supported'))
        }

    });
};