// For any third party dependencies, like jQuery, place them in the lib folder.

// Configure loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.

requirejs.config({
    baseUrl: 'lib',
    map: {
        "*": {
            "text": "require-text"
            
        }    },
    paths: {
        jquery: 'jquery.min',
        app: '../app',
        views: '../views',
    }
});
// Start loading the main app file. Put all of
// your application logic in there.
requirejs(['app/main']);