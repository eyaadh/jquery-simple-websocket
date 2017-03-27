module.exports = function(grunt) {

grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
        files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
        options: {
            globals: {
              jQuery: true
            }
        }
    },
    uglify: {
        my_target: {
            files: {
                'dist/jquery.simple.websocket.min.js': ['src/jquery.simple.websocket.js']
            }
        }
    },
    jasmine: {
        test: {
            src: 'src/*.js', 
            options: {
                vendor: [
                'bower_components/jquery/dist/jquery.js',
                'bower_components/jasmine-jquery/lib/jasmine-jquery.js'
                ], 
                specs: 'test/*.spec.js'
            }
        }
    },
    nodemon: {
        dev: {
            script: 'src/server.js',
            options: {
                nodeArgs: ['--debug'],
                env: {
                    PORT: '8282'
                }
            }
        }
    },
    watch: {
        files: ['<%= jshint.files %>'],
        tasks: ['jshint']
    }
});

grunt.registerTask('server', function (target) {
    // Running nodejs in a different process and displaying output on the main console
    var nodemon = grunt.util.spawn({
         cmd: 'grunt',
         grunt: true,
         args: 'nodemon'
    });
    nodemon.stdout.pipe(process.stdout);
    nodemon.stderr.pipe(process.stderr);

    // here you can run other tasks e.g. 
    // grunt.task.run([ 'watch' ]);
});

// Next one would load plugins
grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-nodemon');

grunt.loadNpmTasks('grunt-contrib-jasmine');
grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.loadNpmTasks('grunt-contrib-watch');

grunt.registerTask('default', ['jshint', 'uglify', 'server', 'jasmine']);

};