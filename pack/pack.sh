# create client package
rsync -a --info=progress2 --delete --delete-excluded --include-from=filter.txt ../client/ ./sysmon-client/
rsync -a --info=progress2 --exclude=.gitkeep ./include-client/ ./sysmon-client/

# create server package
rsync -a --info=progress2 --delete --delete-excluded --include-from=filter.txt ../server/ ./sysmon-server/
rsync -a --info=progress2 --exclude=.gitkeep ./include-server/ ./sysmon-server/