# Add start commands in the user's bashrc.
echo "export MIRROR_HOME=~/smart-mirror" >> ~/.bashrc
echo "run_mirror () { ( cd \$MIRROR_HOME && DISPLAY=:0 npm run \"\$@\" ); }" >> ~/.bashrc
echo "alias mirror=run_mirror" >> ~/.bashrc
cd ~ && source .bashrc
