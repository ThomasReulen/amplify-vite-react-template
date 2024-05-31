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

    state: RecorderState = {
        transcribedText: ""
    };
    
    onTranscriptionDataReceived(data: any) {
        console.log(data)
        // this.transcribedTextRef.insertAdjacentHTML("beforeend", data);
    };     

    clearTranscription() {
        this.setState({transcribedText: ''})
    }

    async stopRecording(that: any) {              
        // @ts-ignore  
        const { stopRecording } = await import("./libs/transcribeClient.js");
        stopRecording();
        that.recording = false;
    };

    async startRecording(that: any) {
        
        await this.clearTranscription();                        
        
        try {
            that.recording = true;
            // @ts-ignore
            const { startRecording } = await import("./libs/transcribeClient.js");
            await startRecording('DE', this.onTranscriptionDataReceived);
        } catch (e) {
            console.log("An error occurred while recording",e); 
            await that.stopRecording();
        }
    };

    onRecordClick() {
        console.log("start record button pressed ... ", this)

        if (this.recording) {
            this.stopRecording(this);
        } else {
            this.startRecording(this);
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