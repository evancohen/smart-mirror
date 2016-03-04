try
{
    // http://nodejs.org/api.html#_child_processes
    var sys = require('sys')
    var exec = require('child_process').exec;

    function puts(error, stdout, stderr)
    {
        sys.puts(stdout)
    }
}
catch(err)
{
    // Create the functions if it fails so dependent code won't break
    function puts(error, stdout, stderr) {}
    function exec(arg1, arg2) {}
}
