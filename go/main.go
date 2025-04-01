package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"strings"
	"time"
)

const (
	currentVersion = "v0.0.0"
	owner          = "isuretpolos"
	repo           = "AetherOneGo"
)

type Asset struct {
	Name string `json:"name"`
	URL  string `json:"browser_download_url"`
}

type Release struct {
	TagName string  `json:"tag_name"`
	Assets  []Asset `json:"assets"`
}

func main() {
	release, err := fetchLatestRelease(owner, repo)
	if err != nil {
		fmt.Println("Fehler beim Abrufen der Release:", err)
		return
	}

	if release.TagName != currentVersion {
		fmt.Printf("Neue Version gefunden: %s\n", release.TagName)
		asset := findAssetForOS(release)
		if asset == nil {
			fmt.Println("Kein passendes Asset für dieses OS gefunden.")
			return
		}

		tempFile := "app_update_tmp"
		if runtime.GOOS == "windows" {
			tempFile += ".exe"
		}

		fmt.Println("Lade Update herunter:", asset.Name)
		err = downloadFile(asset.URL, tempFile)
		if err != nil {
			fmt.Println("Fehler beim Download:", err)
			return
		}

		err = os.Chmod(tempFile, 0755)
		if err != nil {
			fmt.Println("Fehler beim Setzen der Berechtigungen:", err)
			return
		}

		startUpdater(tempFile)
		os.Exit(0)
	} else {
		fmt.Println("Aktuelle Version ist auf dem neuesten Stand.")
	}
}

func fetchLatestRelease(owner, repo string) (*Release, error) {

	url := fmt.Sprintf("https://api.github.com/repos/%s/%s/releases/latest", owner, repo)
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var rel Release
	if err := json.NewDecoder(resp.Body).Decode(&rel); err != nil {
		return nil, err
	}
	return &rel, nil
}

func findAssetForOS(rel *Release) *Asset {
	osStr := runtime.GOOS
	archStr := runtime.GOARCH

	for _, asset := range rel.Assets {
		if strings.Contains(asset.Name, osStr) && strings.Contains(asset.Name, archStr) {
			return &asset
		}
	}
	return nil
}

func downloadFile(url, path string) error {
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	file, err := os.Create(path)
	if err != nil {
		return err
	}
	defer file.Close()

	_, err = io.Copy(file, resp.Body)
	return err
}

func startUpdater(tempFile string) {
	var cmd *exec.Cmd
	executable, _ := os.Executable()

	if runtime.GOOS == "windows" {
		cmd = exec.Command(tempFile, "update", executable)
	} else {
		cmd = exec.Command("./"+tempFile, "update", executable)
	}

	cmd.Start()
}

// Update-Prozess abhandeln
func init() {
	if len(os.Args) == 3 && os.Args[1] == "update" {
		originalFile := os.Args[2]
		updateProcess(originalFile)
	}
}

func updateProcess(original string) {
	time.Sleep(2 * time.Second)

	err := os.Remove(original)
	if err != nil {
		fmt.Println("Fehler beim Löschen der alten Version:", err)
		return
	}

	err = os.Rename(os.Args[0], original)
	if err != nil {
		fmt.Println("Fehler beim Umbenennen der neuen Version:", err)
		return
	}

	cmd := exec.Command(original)
	cmd.Start()
	os.Exit(0)
}
