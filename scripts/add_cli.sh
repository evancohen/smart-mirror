if ! grep -q 'run_mirror' ~/.bashrc; then
    sed -i -e '$a\
\
#smart-mirror CLI\
export MIRROR_HOME=~/smart-mirror\
run_mirror () { ( cd $MIRROR_HOME && DISPLAY=:0 npm run "$@" ); }\
alias mirror=run_mirror\' ~/.bashrc;
fi

cd ~ && source .bashrc
