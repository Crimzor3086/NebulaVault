package config

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/spf13/viper"
)

type Config struct {
	Server   ServerConfig   `mapstructure:"server"`
	Storage  StorageConfig  `mapstructure:"storage"`
	Logging  LoggingConfig  `mapstructure:"logging"`
	Network  NetworkConfig  `mapstructure:"network"`
	Security SecurityConfig `mapstructure:"security"`
}

type ServerConfig struct {
	Host         string        `mapstructure:"host"`
	Port         int           `mapstructure:"port"`
	ReadTimeout  time.Duration `mapstructure:"read_timeout"`
	WriteTimeout time.Duration `mapstructure:"write_timeout"`
	IdleTimeout  time.Duration `mapstructure:"idle_timeout"`
}

type StorageConfig struct {
	DataDir        string `mapstructure:"data_dir"`
	MaxFileSize    int64  `mapstructure:"max_file_size"`
	ChunkSize      int    `mapstructure:"chunk_size"`
	TempDir        string `mapstructure:"temp_dir"`
	CleanupPeriod  time.Duration `mapstructure:"cleanup_period"`
}

type LoggingConfig struct {
	Level  string `mapstructure:"level"`
	Format string `mapstructure:"format"`
	Output string `mapstructure:"output"`
}

type NetworkConfig struct {
	IndexerEndpoint  string        `mapstructure:"indexer_endpoint"`
	TransferEndpoint string        `mapstructure:"transfer_endpoint"`
	CoreEndpoint     string        `mapstructure:"core_endpoint"`
	RPCURL           string        `mapstructure:"rpc_url"`
	ChainID          int64         `mapstructure:"chain_id"`
	ContractAddress  string        `mapstructure:"contract_address"`
	PrivateKey       string        `mapstructure:"private_key"`
	Timeout          time.Duration `mapstructure:"timeout"`
	RetryAttempts    int           `mapstructure:"retry_attempts"`
	RetryDelay       time.Duration `mapstructure:"retry_delay"`
}

type SecurityConfig struct {
	EnableTLS     bool   `mapstructure:"enable_tls"`
	CertFile      string `mapstructure:"cert_file"`
	KeyFile       string `mapstructure:"key_file"`
	AllowedHosts  []string `mapstructure:"allowed_hosts"`
	RateLimit     int    `mapstructure:"rate_limit"`
	RateLimitWindow time.Duration `mapstructure:"rate_limit_window"`
}

var AppConfig *Config

func LoadConfig(configPath string) (*Config, error) {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	
	if configPath != "" {
		viper.AddConfigPath(configPath)
	}
	
	viper.AddConfigPath(".")
	viper.AddConfigPath("./configs")
	viper.AddConfigPath("/etc/nebularvault-agent")
	
	// Set default values
	setDefaults()
	
	// Enable reading from environment variables
	viper.AutomaticEnv()
	viper.SetEnvPrefix("NEBULARVAULT")
	
	// Read config file
	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return nil, fmt.Errorf("error reading config file: %w", err)
		}
		// Config file not found, use defaults and environment variables
	}
	
	var config Config
	if err := viper.Unmarshal(&config); err != nil {
		return nil, fmt.Errorf("error unmarshaling config: %w", err)
	}
	
	// Validate configuration
	if err := validateConfig(&config); err != nil {
		return nil, fmt.Errorf("config validation failed: %w", err)
	}
	
	AppConfig = &config
	return &config, nil
}

func setDefaults() {
	// Server defaults
	viper.SetDefault("server.host", "0.0.0.0")
	viper.SetDefault("server.port", 8080)
	viper.SetDefault("server.read_timeout", "30s")
	viper.SetDefault("server.write_timeout", "30s")
	viper.SetDefault("server.idle_timeout", "120s")
	
	// Storage defaults
	viper.SetDefault("storage.data_dir", "./data")
	viper.SetDefault("storage.max_file_size", 104857600) // 100MB
	viper.SetDefault("storage.chunk_size", 1024) // 1KB chunks
	viper.SetDefault("storage.temp_dir", "./temp")
	viper.SetDefault("storage.cleanup_period", "1h")
	
	// Logging defaults
	viper.SetDefault("logging.level", "info")
	viper.SetDefault("logging.format", "json")
	viper.SetDefault("logging.output", "stdout")
	
	// Network defaults
	viper.SetDefault("network.indexer_endpoint", "https://indexer.0g.ai")
	viper.SetDefault("network.transfer_endpoint", "https://transfer.0g.ai")
	viper.SetDefault("network.core_endpoint", "https://core.0g.ai")
	viper.SetDefault("network.rpc_url", "https://evmrpc-testnet.0g.ai")
	viper.SetDefault("network.chain_id", 16601)
	viper.SetDefault("network.contract_address", "0xd332ABE4395c5173E04F4cbBF39DB175C23ad0eC")
	viper.SetDefault("network.private_key", "")
	viper.SetDefault("network.timeout", "30s")
	viper.SetDefault("network.retry_attempts", 3)
	viper.SetDefault("network.retry_delay", "5s")
	
	// Security defaults
	viper.SetDefault("security.enable_tls", false)
	viper.SetDefault("security.rate_limit", 100)
	viper.SetDefault("security.rate_limit_window", "15m")
}

func validateConfig(config *Config) error {
	// Validate server config
	if config.Server.Port < 1 || config.Server.Port > 65535 {
		return fmt.Errorf("invalid server port: %d", config.Server.Port)
	}
	
	// Validate storage config
	if config.Storage.MaxFileSize <= 0 {
		return fmt.Errorf("invalid max file size: %d", config.Storage.MaxFileSize)
	}
	
	if config.Storage.ChunkSize <= 0 {
		return fmt.Errorf("invalid chunk size: %d", config.Storage.ChunkSize)
	}
	
	// Create necessary directories
	if err := createDirectories(config); err != nil {
		return fmt.Errorf("failed to create directories: %w", err)
	}
	
	return nil
}

func createDirectories(config *Config) error {
	dirs := []string{
		config.Storage.DataDir,
		config.Storage.TempDir,
		filepath.Dir(config.Logging.Output),
	}
	
	for _, dir := range dirs {
		if dir != "" && dir != "stdout" && dir != "stderr" {
			if err := os.MkdirAll(dir, 0755); err != nil {
				return fmt.Errorf("failed to create directory %s: %w", dir, err)
			}
		}
	}
	
	return nil
}

func GetConfig() *Config {
	return AppConfig
}
