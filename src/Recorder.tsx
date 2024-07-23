import React  from "react";
import { StartSpeechSynthesisTaskCommand,StartSpeechSynthesisTaskCommandInput } from "@aws-sdk/client-polly";

type RecorderProps = {
    transcribedText: string;
    translatedText: string;
}
type RecorderState = {
    transcribedText: string;
    translatedText: string;
}

class Recorder extends React.Component<RecorderProps, RecorderState> {

    recordButtonRef: React.RefObject<HTMLButtonElement> = React.createRef();
    transcribedTextRef: React.RefObject<HTMLParagraphElement> = React.createRef();

    translateButtonRef: React.RefObject<HTMLButtonElement> = React.createRef(); 
    translatedTextRef: React.RefObject<HTMLParagraphElement> = React.createRef();

    readTextButtonRef: React.RefObject<HTMLButtonElement> = React.createRef();
    
    recording: boolean = false;

    TranscribedMessage: string = "";

    state: RecorderState = {
        transcribedText: "",
        translatedText: ""
    };
    
    onTranscriptionDataReceived(data: any) {
        console.log(data)
        this.TranscribedMessage += ' ' + data;
        this.setState({transcribedText: this.TranscribedMessage})
        // this.transcribedTextRef.insertAdjacentHTML("beforeend", data);
    };     

    clearTranscription() {
        this.TranscribedMessage = '';
        this.setState({transcribedText: this.TranscribedMessage})        
    }

    async stopRecording(that: any) {              
        // @ts-ignore  
        const { stopRecording } = await import("./libs/transcribeClient.js");
        stopRecording();
        that.recording = false;
    };

    async startRecording() {
        // List cameras and microphones.
        window.navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
            devices.forEach((device) => {
            console.log(`${device.kind}: ${device.label} id = ${device.deviceId}`);
            });
        })
        .catch((err) => {
            console.error(`${err.name}: ${err.message}`);
        });
        
        await this.clearTranscription();                        
        
        try {
            this.recording = true;
            // @ts-ignore
            const { startRecording } = await import("./libs/transcribeClient.js");
            await startRecording('de-DE', this.onTranscriptionDataReceived.bind(this));
        } catch (e) {
            console.log("An error occurred while recording: ",e); 
            await this.stopRecording(this);
        }
    };

    async translateText() {
        const sourceText = this.state.transcribedText;
        console.log("try to tanslate > ",sourceText);

        if (sourceText.length === 0) {
          alert("No text to translate!");
          return;
        }

        //const targetLanguage = translationLanguageList.value;
        // if (targetLanguage === "nan") {
        //     alert("Please select a language to translate to!");
        //     return;
        // }

        const targetLanguage = 'en-EN';

        try {   
            // @ts-ignore  
          const { translateTextToLanguage } = await import("./libs/translateClient.js");
          const translation = await translateTextToLanguage(
            sourceText,
            targetLanguage,
          );
          if (translation) {
            this.setState({translatedText: translation})
          }
        } catch (e) {
          console.log("There was an error translating the text: ", e);
        }
    };
      

    onRecordClick() {
        console.log("start record button pressed ... ", this)

        if (this.recording) {
            this.stopRecording(this);
        } else {
            this.startRecording();
        }            
        
    }   

    onTranslateClick() {
        console.log("translate button pressed ... ", this);

        this.translateText();
        
    }   

    async onReadTextClick() {
        console.log("read text button pressed ... ", this);

        
        // @ts-ignore  
        const { pollyClient } = await import("./libs/pollyClient.js");

        let params: StartSpeechSynthesisTaskCommandInput = {
            OutputFormat: "mp3",
            OutputS3BucketName: "reulen-data-bucket",
            Text: this.state.translatedText,
            TextType: "text",
            VoiceId: "Joanna",
            SampleRate: "22050",
        }
        const command = new StartSpeechSynthesisTaskCommand(params);

        const run = async () => {
            try {
                await pollyClient.send(command);
                console.log("Success, audio file added to " + params.OutputS3BucketName);
            } catch (err) {
                console.log("Error putting object", err);
            }
        };
        run();
        
    }   

    signOut() {

    }

    render() {

        return (        
            <div>
                <button onClick={this.signOut.bind(this)}>Sign out</button>
                <hr/>
                <p ref={this.transcribedTextRef}>{this.state.transcribedText}</p>
                <button ref={this.recordButtonRef} onClick={this.onRecordClick.bind(this)}>Record</button>
                <hr/>
                <button ref={this.translateButtonRef} onClick={this.onTranslateClick.bind(this)}>Translate</button>
                <p ref={this.translatedTextRef}>{this.state.translatedText}</p>
                <button ref={this.readTextButtonRef} onClick={this.onReadTextClick.bind(this)}>Read</button>
                <hr/>
            </div>
            )
        
    }
}

export default Recorder;