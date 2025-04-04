package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
	"time"
)

type Result struct {
	Numbers []uint32 `json:"numbers"`
}

// measureRandomBitInteger generates a 32-bit integer based on loop timing differences
func measureRandomBitInteger(iterations int) uint32 {
	bits := make([]byte, 0, 32)

	for len(bits) < 32 {
		start1 := time.Now()
		for i := 0; i < iterations; i++ {
			_ = rand.Intn(10+1) * rand.Intn(10+1)
		}
		end1 := time.Now()

		start2 := time.Now()
		for i := 0; i < iterations; i++ {
			_ = rand.Intn(10+1) * rand.Intn(10+1)
		}
		end2 := time.Now()

		if end1.Sub(start1) < end2.Sub(start2) {
			bits = append(bits, '1')
		} else {
			bits = append(bits, '0')
		}

		time.Sleep(time.Millisecond) // slight pause between iterations
	}

	// Convert bit string to integer
	bitString := string(bits)
	value, _ := strconv.ParseUint(bitString, 2, 32)
	return uint32(value)
}

func generateHandler(w http.ResponseWriter, r *http.Request) {
	countStr := r.URL.Query().Get("count")
	loopsStr := r.URL.Query().Get("loops")

	count := 1
	loops := 50

	if countStr != "" {
		if parsed, err := strconv.Atoi(countStr); err == nil && parsed > 0 {
			count = parsed
		}
	}
	if loopsStr != "" {
		if parsed, err := strconv.Atoi(loopsStr); err == nil && parsed > 0 {
			loops = parsed
		}
	}

	type jobResult struct {
		index int
		value uint32
	}

	results := make([]uint32, count)
	resultChan := make(chan jobResult)

	// Launch goroutines
	for i := 0; i < count; i++ {
		go func(idx int) {
			value := measureRandomBitInteger(loops)
			resultChan <- jobResult{index: idx, value: value}
		}(i)
	}

	// Collect results
	for i := 0; i < count; i++ {
		res := <-resultChan
		results[res.index] = res.value
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	prettyJSON, err := json.MarshalIndent(Result{Numbers: results}, "", "  ")
	if err != nil {
		http.Error(w, "Failed to encode JSON", http.StatusInternalServerError)
		return
	}

	w.Write(prettyJSON)
}

func main() {
	runtime.GOMAXPROCS(runtime.NumCPU())
	port := flag.Int("port", 80, "Port to serve on")
	staticDir := flag.String("static", "./static", "Directory to serve static files from")
	flag.Parse()

	rand.Seed(time.Now().UnixNano())

	// Serve static files
	fs := http.FileServer(http.Dir(filepath.Clean(*staticDir)))
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if strings.HasSuffix(r.URL.Path, ".js") {
			w.Header().Set("Content-Type", "application/javascript")
			w.Header().Set("content-encoding", "utf-8")
		}
		fs.ServeHTTP(w, r)
	})

	// REST API
	http.HandleFunc("/generate", generateHandler)

	addr := fmt.Sprintf(":%d", *port)
	log.Printf("Serving on http://localhost%s (static folder: %s)", addr, *staticDir)
	log.Fatal(http.ListenAndServe(addr, nil))
}
