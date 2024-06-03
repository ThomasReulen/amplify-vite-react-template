import React  from "react";

type RecorderProps = {
    transcribedText: string;
}
type RecorderState = {
    transcribedText: string;
}

class Recorder extends React.Component<RecorderProps, RecorderState> {

    transcribedTextRef: React.RefObject<HTMLParagraphElement> = React.createRef();
    recordButtonRef: React.RefObject<HTMLButtonElement> = React.createRef();
    recording: boolean = false;

    TranscribedMessage: string = "";

    state: RecorderState = {
        transcribedText: ""
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

    onRecordClick() {
        console.log("start record button pressed ... ", this)

        if (this.recording) {
            this.stopRecording(this);
        } else {
            this.startRecording();
        }            
        
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
            </div>
            )
        
    }
}

export default Recorder;