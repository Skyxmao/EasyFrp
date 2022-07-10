const child_process = require("child_process")
const fs = require("fs")
const decamelize = require("decamelize")
const tmp = require("tmp")
const os = require("os")
var path = require('path');

const getTemporaryConfigFile = async (config) => {
    const frpConfigContent = `${Object.entries(config)
        .map(
          ([group, subObj]) =>
            `[${group}]\n${Object.entries(subObj)
              .map(([k, v]) => `${decamelize(k, "_").toLowerCase()} = ${v}`)
              .join("\n")}`
        )
        .join("\n\n")}`
    configPath = tmp.tmpNameSync() + ".ini"
    fs.writeFileSync(configPath, frpConfigContent)
    return configPath;
}
const getFrpcPath = async () => {
    const platform = os.platform()
    const arch = os.arch()
    let osRelease = null
    switch (platform) {
        case "win32":
          osRelease = `windows_${arch.replace("x64", "amd64").replace("x32", "386")}`
          break
        case "darwin":
          osRelease = "darwin_amd64"
          break
        case "freebsd":
          osRelease = "freebsd"
          break
        case "linux":
          osRelease = `linux_${arch.replace("x64", "amd64")}`
          break
        default:
          osRelease = `${platform}_${arch}`
    }
    const releaseVersionToUse = "0.43.0"
    return path.join(__dirname,"../frp",`frp_${releaseVersionToUse}_${osRelease}/frpc`);
}
module.exports.startClient = async (config,stdoutCallback,stderrCallback) => {
    const configPath = await getTemporaryConfigFile(config)
    const frpcPath = await getFrpcPath();
    
    const proc = child_process.spawn(frpcPath, ["-c", configPath], {
        shell: true,
    })
    proc.stdout.on("data", (data) => {
        console.log({ frpcStdout: data.toString() })
        stdoutCallback(data);
    })
    proc.stderr.on("data", (data) => {
        console.log({ frpcStderr: data.toString() })
        stderrCallback(data);
    })
    
    let isClosed = false
    proc.on("close", (code) => {
        isClosed = true
    })

    await new Promise((resolve, reject) => {
        const processCloseTimeout = setTimeout(() => {
          if (isClosed) {
            reject("frpc didn't start properly")
          } else {
            reject(`frpc didn't respond`)
            proc.kill("SIGINT")
          }
        }, 5000) // 500ms to wait for start
    
        async function checkIfRunning() {
          setTimeout(() => {
            if (!isClosed) {
              clearTimeout(processCloseTimeout)
              resolve()
            }
          }, 500)
        }
        checkIfRunning()
      })
    
      return {
        proc,
        stop: async () => {
          proc.kill("SIGINT")
        },
      }
}