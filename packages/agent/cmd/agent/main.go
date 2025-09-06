package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"github.com/spf13/cobra"

	"nebularvault-agent/config"
	"nebularvault-agent/internal/handlers"
	"nebularvault-agent/internal/middleware"
	"nebularvault-agent/internal/storage"
	"nebularvault-agent/internal/zerog"
)

var (
	configPath string
	logLevel   string
)

var rootCmd = &cobra.Command{
	Use:   "nebularvault-agent",
	Short: "NebularVault Storage Agent for 0G Network integration",
	Long: `NebularVault Agent is a storage service that handles file chunking,
Merkle tree generation, and integration with the 0G Storage network.`,
	Run: runAgent,
}

func init() {
	rootCmd.PersistentFlags().StringVar(&configPath, "config", "", "Path to configuration file")
	rootCmd.PersistentFlags().StringVar(&logLevel, "log-level", "info", "Log level (debug, info, warn, error)")
}

func main() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
}

func runAgent(cmd *cobra.Command, args []string) {
	// Load configuration
	cfg, err := config.LoadConfig(configPath)
	if err != nil {
		logrus.Fatalf("Failed to load configuration: %v", err)
	}

	// Setup logging
	setupLogging(cfg.Logging.Level)

	logrus.Info("🚀 Starting NebularVault Agent...")
	logrus.Infof("Configuration loaded from: %s", configPath)

	// Initialize storage manager
	storageManager := storage.NewStorageManager(
		cfg.Storage.DataDir,
		cfg.Storage.TempDir,
		cfg.Storage.ChunkSize,
	)

	// Initialize 0G client
	zeroGConfig := &zerog.ZeroGConfig{
		IndexerEndpoint:  cfg.Network.IndexerEndpoint,
		TransferEndpoint: cfg.Network.TransferEndpoint,
		CoreEndpoint:     cfg.Network.CoreEndpoint,
		RPCURL:           cfg.Network.RPCURL,
		ChainID:          cfg.Network.ChainID,
		ContractAddress:  cfg.Network.ContractAddress,
		PrivateKey:       cfg.Network.PrivateKey,
		Timeout:          cfg.Network.Timeout,
	}
	
	zeroGClient, err := zerog.NewZeroGClient(zeroGConfig)
	if err != nil {
		logrus.Fatalf("Failed to initialize 0G client: %v", err)
	}

	// Test 0G connection
	healthResp, err := zeroGClient.HealthCheck()
	if err != nil {
		logrus.Warnf("0G Storage connection test failed: %v", err)
		logrus.Warn("Agent will continue but 0G operations may fail")
	} else {
		logrus.Info("✅ 0G Storage connection verified")
		logrus.Info(healthResp.Message)
	}

	// Setup HTTP server
	server := setupServer(cfg, storageManager, zeroGClient)

	// Start server in goroutine
	go func() {
		addr := fmt.Sprintf("%s:%d", cfg.Server.Host, cfg.Server.Port)
		logrus.Infof("🌐 Server starting on %s", addr)
		
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logrus.Fatalf("Server failed to start: %v", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logrus.Info("🛑 Shutting down NebularVault Agent...")

	// Graceful shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		logrus.Errorf("Server forced to shutdown: %v", err)
	}

	logrus.Info("✅ NebularVault Agent stopped gracefully")
}

func setupLogging(level string) {
	logrus.SetFormatter(&logrus.JSONFormatter{
		TimestampFormat: time.RFC3339,
	})

	switch level {
	case "debug":
		logrus.SetLevel(logrus.DebugLevel)
	case "info":
		logrus.SetLevel(logrus.InfoLevel)
	case "warn":
		logrus.SetLevel(logrus.WarnLevel)
	case "error":
		logrus.SetLevel(logrus.ErrorLevel)
	default:
		logrus.SetLevel(logrus.InfoLevel)
	}
}

func setupServer(cfg *config.Config, storageManager *storage.StorageManager, zeroGClient *zerog.ZeroGClient) *http.Server {
	if cfg.Logging.Level == "debug" {
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()

	// Middleware
	router.Use(middleware.Logger())
	router.Use(middleware.Recovery())
	router.Use(middleware.CORS())
	router.Use(middleware.RateLimit(cfg.Security.RateLimit, cfg.Security.RateLimitWindow))

	// Health check
	router.GET("/health", handlers.HealthCheck)

	// API routes
	api := router.Group("/api/v1")
	{
		// File operations
		files := api.Group("/files")
		{
			files.POST("/upload", handlers.UploadFile(storageManager, zeroGClient))
			files.GET("/download/:hash", handlers.DownloadFile(storageManager, zeroGClient))
			files.GET("/metadata/:hash", handlers.GetFileMetadata(storageManager))
			files.GET("/proof/:hash", handlers.GetProof(zeroGClient))
		}

		// Storage operations
		storage := api.Group("/storage")
		{
			storage.POST("/chunk", handlers.ChunkFile(storageManager))
			storage.POST("/reconstruct", handlers.ReconstructFile(storageManager))
			storage.GET("/verify/:hash", handlers.VerifyFileIntegrity(storageManager))
		}
	}

	return &http.Server{
		Addr:         fmt.Sprintf("%s:%d", cfg.Server.Host, cfg.Server.Port),
		Handler:      router,
		ReadTimeout:  cfg.Server.ReadTimeout,
		WriteTimeout: cfg.Server.WriteTimeout,
		IdleTimeout:  cfg.Server.IdleTimeout,
	}
}
