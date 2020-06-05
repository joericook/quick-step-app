// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in cordova-simulate or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
(function () {
    "use strict";

    // Create audio context
    var audioCtx = new AudioContext();

    // Create a buffer loader object
    var bufferLoader = new BufferLoader(audioCtx);

    // Buffer to hold drum kit samples
    // (kick has key"kick", snare has key "snare" etc.)
    var sampleBuffers = {};

    // URL of each sample to load from sample folder
    var sampleURLs = { "kick": "samples/909_kick.wav", "snare": "samples/909_snare.wav", "clap": "samples/909_clap.wav", "closedHihat": "samples/909_closedhihat.wav", "openHihat": "samples/909_openhihat.wav", "crash": "samples/909_crash.wav", "midTom": "samples/909_midtom.wav", "hiTom": "samples/909_hitom.wav"};

    // Flag to determine whether or not the samples have finished loading
    var samplesLoaded = false;

    // Load samples into the list and associate them with their respective keys 
    bufferLoader.loadBufferList(sampleBuffers, sampleURLs, function () {

        console.log("Finished loading sampleBuffers!");
        samplesLoaded = true;
    });

    // Create pattern scheduler
    var scheduler = new Scheduler(audioCtx, {
        onQueue: queueStep,
        tempo: 120,
        swing: 0,                                       //no initial swing
        maxSwing: 1.0,                                  //actual swing = swing * maxSwing
        onAnim: animateStep
    });

    // Key/value list to hold pattern steps for each track
    var steps = {};

    // Each element in the key/value list is an array of steps
    steps["kick"] = [];
    steps["snare"] = [];
    steps["clap"] = [];
    steps["closedHihat"] = [];
    steps["openHihat"] = [];
    steps["crash"] = [];
    steps["midTom"] = [];
    steps["hiTom"] = [];

    // Initialise all step values to their off state (false)
    for (var i = 0; i < scheduler.getStepsPerPattern(); i++) {
        steps["kick"][i] = false;
        steps["snare"][i] = false;
        steps["clap"][i] = false;
        steps["closedHihat"][i] = false;
        steps["openHihat"][i] = false;
        steps["crash"][i] = false;
        steps["midTom"][i] = false;
        steps["hiTom"][i] = false;
    }

    //Create Master gain node
    var masterGainNode = audioCtx.createGain();

    //Create individual track gain nodes
    var kickGainNode = audioCtx.createGain();
    var snareGainNode = audioCtx.createGain();
    var clapGainNode = audioCtx.createGain();
    var closedHihatGainNode = audioCtx.createGain();
    var openHihatGainNode = audioCtx.createGain();
    var crashGainNode = audioCtx.createGain();
    var midTomGainNode = audioCtx.createGain();
    var hiTomGainNode = audioCtx.createGain();

    //Create individual Stereo panner nodes
    var kickPanNode = audioCtx.createStereoPanner();
    var snarePanNode = audioCtx.createStereoPanner();
    var clapPanNode = audioCtx.createStereoPanner();
    var closedHihatPanNode = audioCtx.createStereoPanner();
    var openHihatPanNode = audioCtx.createStereoPanner();
    var crashPanNode = audioCtx.createStereoPanner();
    var midTomPanNode = audioCtx.createStereoPanner();
    var hiTomPanNode = audioCtx.createStereoPanner();


    // onQueue event handler
    function queueStep(timeStamp, stepStamp) {

        // Iterate over each key/value pair in lists (each one is an array)
        // track will be the key value ("kick", "snare" or "hat")
        for (var track in steps) {

            // Is the element in the step array for this track on?
            if (steps[track][stepStamp.patternPos]) {

                // Get an AudioBufferSourceNode.
                // This is the AudioNode to use when we want to play an AudioBuffer
                var source = audioCtx.createBufferSource();

                // Set the buffer to the sample with the key value of the track variable
                source.buffer = sampleBuffers[track];

                if (track === "kick") {                                     //If selected td element belongs to track: 'kick',
                    source.detune.value = $("#kickPitch").val();            //make the samples detune value equal to the value of it's pitch slider,
                    source.connect(kickPanNode);                            //connect the source to the kick's pan node,
                    kickPanNode.connect(kickGainNode);                      //connect the kick's pan node to it's gain node,
                    kickGainNode.connect(masterGainNode);                   //and connect the kick's gain node to the master gain node.
                }

                if (track === "snare") {                                    //Repeat connections for the remaining tracks
                    source.detune.value = $("#snarePitch").val();
                    source.connect(snarePanNode);
                    snarePanNode.connect(snareGainNode);
                    snareGainNode.connect(masterGainNode);
                }

                if (track === "clap") {
                    source.detune.value = $("#clapPitch").val();
                    source.connect(clapPanNode);
                    clapPanNode.connect(clapGainNode);
                    clapGainNode.connect(masterGainNode);
                }

                if (track === "closedHihat") {
                    source.detune.value = $("#closedHihatPitch").val();
                    source.connect(closedHihatPanNode);
                    closedHihatPanNode.connect(closedHihatGainNode);
                    closedHihatGainNode.connect(masterGainNode);
                }

                if (track === "openHihat") {
                    source.detune.value = $("#openHihatPitch").val();
                    source.connect(openHihatPanNode);
                    openHihatPanNode.connect(openHihatGainNode);
                    openHihatGainNode.connect(masterGainNode);
                }

                if (track === "crash") {
                    source.detune.value = $("#crashPitch").val();
                    source.connect(crashPanNode);
                    crashPanNode.connect(crashGainNode);
                    crashGainNode.connect(masterGainNode);
                }

                if (track === "midTom") {
                    source.detune.value = $("#midTomPitch").val();
                    source.connect(midTomPanNode);
                    midTomPanNode.connect(midTomGainNode);
                    midTomGainNode.connect(masterGainNode);
                }

                if (track === "hiTom") {
                    source.detune.value = $("#hiTomPitch").val();
                    source.connect(hiTomPanNode);
                    hiTomPanNode.connect(hiTomGainNode);
                    hiTomGainNode.connect(masterGainNode);
                }

                // Connect master gain to audio out. Individual track gains will be multiplied by master gain value
                masterGainNode.connect(audioCtx.destination);

                // Queue the sample for playback
                source.start(timeStamp.swing);
            }
        }
    }

    // onAnim event handler for step visualisation
    function animateStep(currentStepStamp, lastStepStamp) {

        // Turn on led for current step
        $('#stepLayout tr').eq(0).find('td').eq(currentStepStamp.patternPos).addClass("stepAnim");
        // Turn off led for last step
        $('#stepLayout tr').eq(0).find('td').eq(lastStepStamp.patternPos).removeClass("stepAnim");

        // Repeat for each track
        $('#stepLayout tr').eq(1).find('td').eq(currentStepStamp.patternPos).addClass("stepAnim");
        $('#stepLayout tr').eq(1).find('td').eq(lastStepStamp.patternPos).removeClass("stepAnim");

        $('#stepLayout tr').eq(2).find('td').eq(currentStepStamp.patternPos).addClass("stepAnim");
        $('#stepLayout tr').eq(2).find('td').eq(lastStepStamp.patternPos).removeClass("stepAnim");

        $('#stepLayout tr').eq(3).find('td').eq(currentStepStamp.patternPos).addClass("stepAnim");
        $('#stepLayout tr').eq(3).find('td').eq(lastStepStamp.patternPos).removeClass("stepAnim");

        $('#stepLayout tr').eq(4).find('td').eq(currentStepStamp.patternPos).addClass("stepAnim");
        $('#stepLayout tr').eq(4).find('td').eq(lastStepStamp.patternPos).removeClass("stepAnim");

        $('#stepLayout tr').eq(5).find('td').eq(currentStepStamp.patternPos).addClass("stepAnim");
        $('#stepLayout tr').eq(5).find('td').eq(lastStepStamp.patternPos).removeClass("stepAnim");

        $('#stepLayout tr').eq(6).find('td').eq(currentStepStamp.patternPos).addClass("stepAnim");
        $('#stepLayout tr').eq(6).find('td').eq(lastStepStamp.patternPos).removeClass("stepAnim");

        $('#stepLayout tr').eq(7).find('td').eq(currentStepStamp.patternPos).addClass("stepAnim");
        $('#stepLayout tr').eq(7).find('td').eq(lastStepStamp.patternPos).removeClass("stepAnim");
    }
    //----------------------------------------------------------------------//
    //---------------------------DOCUMENT READY-----------------------------//
    //----------------------------------------------------------------------//
    $(document).ready(function () {
        document.addEventListener('deviceready', onDeviceReady.bind(this), false);
    });

    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener('pause', onPause.bind(this), false);
        document.addEventListener('resume', onResume.bind(this), false);

        //--- SINGLE PAGE START ---//
        // Shows the specified page and hides all of the others
        function showPage(pageToShow) {

            // Hides all elements with the class 'page'
            $(".page").hide();

            // Shows the page specified by the argument 'pageToShow'
            $("#" + pageToShow).show();
        }

        // Shows the page to display initially
        showPage("page1");

        // Click event for all elements with the custom attribute navPage
        $("[data-navPage]").touchstart(function () {

            // Get the page to show from the custom navPage attribute of the clicked element
            var page = $(this).attr("data-navPage");

            // Call the showPage function with the page to show as the argument
            showPage(page);
        });
        //--- SINGLE PAGE END ---//

        // Click event handler for any elements with the custom attribute "data-step"
        $("[data-step]").touchstart(function () {

            // Value of the custom attibute "data-channel" of the parent row of the clicked cell
            var channel = $(this).parent().attr("data-channel");

            // Value of the custom attribute "data-step" of the clicked cell
            var step = $(this).attr("data-step");

            // Flip the boolean value of the clicked step
            steps[channel][step] = !steps[channel][step];

            // Toggle the stepOn class styling for the clicked step
            $(this).toggleClass("stepOn");
        });

        // PLAY/PAUSE BUTTONS 
        $("#playButton").touchstart(function () {

            if (scheduler.isPlaying === false) {                    //If scheduler is not playing when button is clicked,

                $("#stepLayout td").removeClass("stepAnim");        
                scheduler.start();                                  //Start scheduler
                $(this).text("PAUSE");                              //and change button text to 'PAUSE'.
                $("#playButton2").text("PAUSE");                    //Change 2nd page's play button to read 'PAUSE' also
                scheduler.resumePlayback = true;                    //allow the schedule to resume from stop point
            }
            else {                                                  //If scheduler is playing when button is clicked,

                $(this).text("PLAY");                               //change both button's text to 'PLAY',
                $("#playButton2").text("PLAY");                     
                scheduler.stop();                                   //and stop the scheduler
            }
        });

        $("#playButton2").touchstart(function () {                       //Repeated functionality for 2nd page's play button

            if (scheduler.isPlaying === false) {

                $("#stepLayout td").removeClass("stepAnim");
                scheduler.start();
                $(this).text("PAUSE");
                $("#playButton").text("PAUSE");
                scheduler.resumePlayback = true;
            }
            else {
                $(this).text("PLAY");
                $("#playButton").text("PLAY");
                scheduler.stop();
            }
        });

        // STOP BUTTONS
        $("#stopButton").touchstart(function (event) {

            scheduler.resumePlayback = false;                       //Do not allow resuming of playback,
            scheduler.stop();                                       //Stop the scheduler,
            $('#playButton').text("PLAY");                          //and change both play button's text to 'PLAY'.
            $('#playButton2').text("PLAY");
            $("#stepLayout td").removeClass("stepAnim");            //Remove the step animation class completely

        });

        $("#stopButton2").touchstart(function (event) {                  //Repeated functionality for 2nd page button

            scheduler.resumePlayback = false;
            scheduler.stop();
            $('#playButton').text("PLAY");
            $('#playButton2').text("PLAY");
            $("#stepLayout td").removeClass("stepAnim");

        });

        // TEMPO DOWN BUTTONS
        $("#tempoDown").touchstart(function () {
            if (scheduler.tempo > 40) {                             //Prevent tempo from going below 40bpm

                scheduler.tempo = scheduler.tempo - 1;
                $("#tempoText").text(scheduler.tempo + " BPM");     //Update text on both pages
                $("#tempoText2").text(scheduler.tempo + " BPM");

            }
            else {    //Do Nothing
            }
        });

        $("#tempoDown2").touchstart(function () {
            if (scheduler.tempo > 40) {                             //Repeated for 2nd page

                scheduler.tempo = scheduler.tempo - 1;
                $("#tempoText").text(scheduler.tempo + " BPM");
                $("#tempoText2").text(scheduler.tempo + " BPM");

            }
            else {    //Do Nothing
            }
        });

        // TEMPO UP BUTTONS
        $("#tempoUp").touchstart(function () {
            if (scheduler.tempo < 200) {                            //Prevent tempo from going over 200bpm 

                scheduler.tempo = scheduler.tempo + 1;
                $("#tempoText").text(scheduler.tempo + " BPM");
                $("#tempoText2").text(scheduler.tempo + " BPM");
            }
            else {    //Do Nothing
            }
        });

        $("#tempoUp2").touchstart(function () {
            if (scheduler.tempo < 200) {                

                scheduler.tempo = scheduler.tempo + 1;
                $("#tempoText").text(scheduler.tempo + " BPM");
                $("#tempoText2").text(scheduler.tempo + " BPM");
            }
            else {    //Do Nothing
            }
        });

        // SWING DOWN BUTTONS
        $("#swingDown").touchstart(function () {
            if (scheduler.swing > 0.0) {                            //Prevent swing from going below 0%

                scheduler.swing = scheduler.swing - 0.01;
                var swingFixed = scheduler.swing * 100;             //variable to hold swing as % 
                swingFixed = swingFixed.toFixed();                  //and remove decimal points
                $("#swingText").text(swingFixed + "% SWING");
                $("#swingText2").text(swingFixed + "% SWING");
            }
            else {    //Do Nothing
            }
        });

        $("#swingDown2").touchstart(function () {
            if (scheduler.swing > 0.0) {                            

                scheduler.swing = scheduler.swing - 0.01;
                var swingFixed = scheduler.swing * 100;               
                swingFixed = swingFixed.toFixed();                  
                $("#swingText").text(swingFixed + "% SWING");
                $("#swingText2").text(swingFixed + "% SWING");
            }
            else {    //Do Nothing
            }
        });

        // SWING UP BUTTON
        $("#swingUp").touchstart(function () {
            if (scheduler.swing < 0.5) {                            //Prevent swing from going above 50%

                scheduler.swing = scheduler.swing + 0.01;
                var swingFixed = scheduler.swing * 100;             //variable to hold swing as %
                swingFixed = swingFixed.toFixed();                  //and remove decimal points
                $("#swingText").text(swingFixed + "% SWING");
                $("#swingText2").text(swingFixed + "% SWING");
            }
            else {    //Do Nothing
            }
        });

        $("#swingUp2").touchstart(function () {
            if (scheduler.swing < 0.5) {                      

                scheduler.swing = scheduler.swing + 0.01;
                var swingFixed = scheduler.swing * 100;
                swingFixed = swingFixed.toFixed();
                $("#swingText").text(swingFixed + "% SWING");
                $("#swingText2").text(swingFixed + "% SWING");
            }
            else {    //Do Nothing
            }
        });

        // MASTER FADERS
        $("#masterVolume").change(function () {                     //update master volume value when the slider is moved
                                                                    //and ensure that the 2nd pages slider moves to the new value
            masterGainNode.gain.value = $(this).val();              
            $("#masterVolume2").val(masterGainNode.gain.value);
        });

        $("#masterVolume2").change(function () {

            masterGainNode.gain.value = $(this).val();
            $("#masterVolume").val(masterGainNode.gain.value);
        });

        //TRACK VOLUMES
        $("#kickVolume").change(function () {                       //event handlers to change track volumes as their sliders are moved

            kickGainNode.gain.value = $(this).val();
        });

        $("#snareVolume").change(function () {

            snareGainNode.gain.value = $(this).val();
        });

        $("#clapVolume").change(function () {                       

            clapGainNode.gain.value = $(this).val();
        });

        $("#closedHihatVolume").change(function () {

            closedHihatGainNode.gain.value = $(this).val();
        });

        $("#openHihatVolume").change(function () {

            openHihatGainNode.gain.value = $(this).val();
        });

        $("#crashVolume").change(function () {

            crashGainNode.gain.value = $(this).val();
        });

        $("#midTomVolume").change(function () {

            midTomGainNode.gain.value = $(this).val();
        });

        $("#hiTomVolume").change(function () {

            hiTomGainNode.gain.value = $(this).val();
        });

        //TRACK PANNING
        $("#kickPan").change(function () {                          //event handlers to change track panning as sliders are moved

            kickPanNode.pan.value = $(this).val();
        });

        $("#snarePan").change(function () {

            snarePanNode.pan.value = $(this).val();
        });

        $("#clapPan").change(function () {             

            clapPanNode.pan.value = $(this).val();
        });

        $("#closedHihatPan").change(function () {

            closedHihatPanNode.pan.value = $(this).val();
        });

        $("#openHihatPan").change(function () {

            openHihatPanNode.pan.value = $(this).val();
        });

        $("#crashPan").change(function () {

            crashPanNode.pan.value = $(this).val();
        });

        $("#midTomPan").change(function () {

            midTomPanNode.pan.value = $(this).val();
        });

        $("#hiTomPan").change(function () {

            hiTomPanNode.pan.value = $(this).val();
        });

        //KIT CHANGE
        //--------CODE HERE---------//  

        //CLEAR BUTTONS
        $("#clearButton").touchstart(function () {                               //Event handler to clear the step sequencer

            for (var i = 0; i < scheduler.getStepsPerPattern(); i++) {      //Loop through all steps and set all to false

                steps["kick"][i] = false;
                steps["snare"][i] = false;
                steps["clap"][i] = false;
                steps["closedHihat"][i] = false;
                steps["openHihat"][i] = false;
                steps["crash"][i] = false;
                steps["midTom"][i] = false;
                steps["hiTom"][i] = false;
               
                $("#stepLayout td").removeClass("stepOn");                  //Remove "stepOn" class from all steps
            }                                                               
        });

        $("#clearButton2").touchstart(function () {                              //Repeat functionality for 2nd page button

            for (var i = 0; i < scheduler.getStepsPerPattern(); i++) {   
                       
                steps["kick"][i] = false;
                steps["snare"][i] = false;
                steps["clap"][i] = false;
                steps["closedHihat"][i] = false;
                steps["openHihat"][i] = false;
                steps["crash"][i] = false;
                steps["midTom"][i] = false;
                steps["hiTom"][i] = false;
             
                $("#stepLayout td").removeClass("stepOn");                
            }                                                           
        });
    };

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    };

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    };
} )();