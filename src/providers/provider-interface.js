/**
 * Provider Interface
 * Abstract base class defining the contract for provider adapters
 */

/**
 * Abstract provider adapter interface
 * All provider adapters must implement these methods
 */
class ProviderInterface {
  /**
   * Get the provider name
   * @returns {string} Provider identifier
   */
  get name() {
    throw new Error('Subclass must implement name getter');
  }

  /**
   * Get the provider display name
   * @returns {string} Human-readable provider name
   */
  get displayName() {
    throw new Error('Subclass must implement displayName getter');
  }

  /**
   * Get the skills directory path for this provider
   * @param {boolean} global - Whether to use global or local path
   * @param {string} cwd - Current working directory (for local installs)
   * @returns {string} Skills directory path
   */
  getSkillsPath(global, cwd) {
    throw new Error('Subclass must implement getSkillsPath');
  }

  /**
   * Get the settings file path for this provider
   * @param {boolean} global - Whether to use global or local path
   * @param {string} cwd - Current working directory (for local installs)
   * @returns {string} Settings file path
   */
  getSettingsPath(global, cwd) {
    throw new Error('Subclass must implement getSettingsPath');
  }

  /**
   * Install a skill for this provider
   * @param {Object} skill - Skill definition
   * @param {string} targetDir - Target installation directory
   * @param {Object} options - Installation options
   * @returns {Object} Installation result
   */
  async installSkill(skill, targetDir, options) {
    throw new Error('Subclass must implement installSkill');
  }

  /**
   * Install all skills for this provider
   * @param {string} sourceDir - Source skills directory
   * @param {string} targetDir - Target installation directory
   * @param {Object} options - Installation options
   * @returns {Object} Installation results
   */
  async installSkills(sourceDir, targetDir, options) {
    throw new Error('Subclass must implement installSkills');
  }

  /**
   * Configure provider settings (hooks, MCP servers, etc.)
   * @param {Object} settings - Settings to apply
   * @param {string} settingsPath - Path to settings file
   * @returns {Object} Configuration result
   */
  async configureSettings(settings, settingsPath) {
    throw new Error('Subclass must implement configureSettings');
  }

  /**
   * Check if the provider is available/installed
   * @returns {boolean} Whether provider is available
   */
  isAvailable() {
    throw new Error('Subclass must implement isAvailable');
  }

  /**
   * Get feature support matrix for this provider
   * @returns {Object} Feature support flags
   */
  getFeatureSupport() {
    return {
      contextFork: false,
      parallelExecution: false,
      taskTools: false,
      hooks: false,
      toolRestrictions: false,
      userQuestions: false,
      mcpServers: false,
      dynamicContext: false
    };
  }

  /**
   * Transform skill content for this provider
   * @param {string} content - Original skill content
   * @param {Object} metadata - Skill metadata
   * @returns {string} Transformed content
   */
  transformSkillContent(content, metadata) {
    return content;
  }

  /**
   * Get additional files to create for a skill
   * @param {Object} skill - Skill definition
   * @returns {Array} Array of { path, content } objects
   */
  getAdditionalFiles(skill) {
    return [];
  }
}

module.exports = ProviderInterface;
