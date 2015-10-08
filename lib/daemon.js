var cp = require('child_process');

var worker;

function spawn(server, config) {
    worker = cp.spawn('node', [ server, config ]);
    console.log("in spawn");
    worker.on('exit', function (code) {
    console.log(code);
    // console.log(signal);
        if (code !== 0) {
            spawn(server, config);
        }
    });
}

function main(argv) {
    // console.log(argv[0]);
    spawn('../lib/server.js', argv[0]);
    process.on('SIGTERM', function () {
        worker.kill();
        process.exit(0);
    });
}

main(process.argv.slice(2));
