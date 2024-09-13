import fs from 'fs'
const sdk = require('microsoft-cognitiveservices-speech-sdk')
import convertFileFormat from '../../../../../libs/utils/services/audioconverter'
import dotenv from 'dotenv'

dotenv.config()

const speechConfig = sdk.SpeechConfig.fromSubscription(
  process.env.SPEECH_KEY,
  process.env.SPEECH_REGION
)
speechConfig.speechRecognitionLanguage = 'en-US'

async function fromFile(path: string) {
  convertFileFormat(path, './public/uploads/text.wav')
  const text = await new Promise((resolve, reject) => {
    setTimeout(() => {
      if (fs.existsSync('./public/uploads/text.wav')) {
        let audioConfig = sdk.AudioConfig.fromWavFileInput(
          fs.readFileSync('./public/uploads/text.wav')
        )
        let speechRecognizer = new sdk.SpeechRecognizer(
          speechConfig,
          audioConfig
        )
  
        speechRecognizer.recognizeOnceAsync((result: any) => {
          switch (result.reason) {
            case sdk.ResultReason.RecognizedSpeech:
              resolve(result.text)
              break
            case sdk.ResultReason.NoMatch:
              reject('No speech could be recognized: ')
              break
            case sdk.ResultReason.Canceled:
              const cancellation = sdk.CancellationDetails.fromResult(result)
              reject(`CANCELED: Reason=${cancellation.reason}`)
              break
          }
          speechRecognizer.close()
        })
        fs.readdir('./public/uploads', (err, files) => {
          if (err) throw err
          for (const file of files) {
            fs.unlink(`./public/uploads/${file}`, (err) => {
              if (err) throw err
            })
          }
        })
      }
    }, 3000)
  })
  return text
  
   
  
}

class ChatService {
  async speechToText(file: Express.Multer.File) {
    try {
      const filePath = file.path
      const response = await fromFile(filePath)
      if(typeof response === "string"){
        return response
      } else {
        return ''
      }

    } catch (error) {
      throw error
    }
  }
  async sendMessage(message: string) {
    
  }
}

export default ChatService
