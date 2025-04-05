# Build
If you want to build your own version, you need to have the following installed:
- Go, install from [here](https://golang.org/doc/install)
- Node, install from [here](https://nodejs.org), which includes NPM as well

And then run the following commands:
```bash
go get -u github.com/isuretpolos/AetherOneGo
cd $GOPATH/src/github.com/isuretpolos/AetherOneGo
go build
```

You also need to build the UI. Read the [documentation](ui/README.md) for the UI. The distilled UI is embedded inside the executable and released on [Github](https://github.com/isuretpolos/AetherOneGo/releases/latest).

# Release with GoReleaser

```bash
# get the commit hash you want to release (exit with q)
git log
# tag the commit you want to release (don't tag the tag ;)
git tag -a v1.0 <commit-hash> -m "Feature broadcast"
# check if the tag is correct (exit with q)
git show v1.0
# push the 
git push origin v0.1.9
```

