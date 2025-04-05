# Build
If you want to build your own version, you need to have the following installed:
- Go, install from [here](https://golang.org/doc/install)
- Node, install from [here](https://nodejs.org), which includes NPM as well

And then run the following commands:
```bash
go run main.go
```

You also need to build the UI. **Read the [documentation](ui/README.md) for the UI**. The distilled UI is embedded inside the build executable and released on [Github](https://github.com/isuretpolos/AetherOneGo/releases/latest). But if you just want to develop and test the software, you run it directly in Vite (npm run dev) which gives you a realtime preview.

# Release with GoReleaser
Use the format *MAJOR.MINOR.PATCH* for your tags. For example, v1.0.0 for a major release, v1.1.0 for a minor release, and v1.0.1 for a patch release. This helps communicate the nature of changes in each release.

Use consistent and descriptive tag names. For example, v1.0.0-beta1 for a beta release, v1.0.0-rc1 for a release candidate, and v1.0.0 for the final release. This helps in quickly identifying the purpose of each tag.

And finally use annotated tags (-a) to include additional metadata such as the author, release notes, and date. This is particularly useful for public releases.

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
