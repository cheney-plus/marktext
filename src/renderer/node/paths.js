import { rgPath } from 'vscode-ripgrep'
import EnvPaths from 'common/envPaths'
import { isFile2 } from 'common/filesystem'

// // "vscode-ripgrep" is unpacked out of asar because of the binary.
const rgDiskPath = rgPath.replace(/\bapp\.asar\b/, 'app.asar.unpacked')

class RendererPaths extends EnvPaths {
  /**
   * Configure and sets all application paths.
   *
   * @param {string} userDataPath The user data path.
   */
  constructor (userDataPath) {
    if (!userDataPath) {
      throw new Error('No user data path is given.')
    }

    // Initialize environment paths
    super(userDataPath)

    const envRgPath = process.env.MARKTEXT_RIPGREP_PATH
    if (envRgPath && isFile2(envRgPath)) {
      this._ripgrepBinaryPath = envRgPath
    } else if (isFile2(rgDiskPath)) {
      this._ripgrepBinaryPath = rgDiskPath
    } else {
      this._ripgrepBinaryPath = 'rg'
    }
  }

  // Returns the path to ripgrep on disk.
  get ripgrepBinaryPath () {
    return this._ripgrepBinaryPath
  }
}

export default RendererPaths
