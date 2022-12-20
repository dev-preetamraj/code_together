$(document).ready(function(){
    var editor = ace.edit("editor");
    var console_editor = ace.edit('status-div');
    var input_editor = ace.edit('input-div');
    // input_editor.setTheme("ace/theme/monokai");
    input_editor.session.setMode("ace/mode/text");

    var output_editor = ace.edit('output-div');
    // output_editor.setTheme("ace/theme/monokai");
    output_editor.session.setMode("ace/mode/text");
    var setModeObj = {
        "4": "c_cpp",
        "10": "c_cpp",
        "16": "csharp",
        "22": "golang",
        "26": "java",
        "27": "java",
        "29": "javascript",
        "34": "python",
        "43": "text"
    }
    const codeSocket = new WebSocket(
        "ws://"
        + window.location.host
        + "/ws/code/"
        + room_id
        + "/"
        + username
        + "/"
    );
    
    codeSocket.onmessage = function(e){
        var data = JSON.parse(e.data);
        editor.setValue(data.source_code);
        editor.clearSelection();
        if(data.dissable_editor){
            editor.setReadOnly(true);
            $('#submit-code').html("Submitting...");
            $('#submit-code').prop('disabled', true);
        }else {
            editor.setReadOnly(false);
            $('#submit-code').html("Submit");
            $('#submit-code').prop('disabled', false);
        }
        input_editor.setValue(data.input_text);
        input_editor.clearSelection();
        // if(output_editor.getSession().getValue() !== data.output_text){
            
        // }
        output_editor.setValue("");
        output_editor.setValue(data.output_text);
        output_editor.clearSelection();
        var languageID = data.languageID;
        $('#language-id option[value='+languageID+']').attr('selected', 'selected');
        editor.session.setMode("ace/mode/"+setModeObj[languageID]);

        console_editor.setValue("");
        console_editor.setValue(data.console_text);
        console_editor.clearSelection();
        
    };

    codeSocket.onclose = function(e) {
        console.error('Code socket closed unexpectedly');
    };

    var data_set = {
        "source_code": editor.getValue(),
        "languageID": "",
        "input_text": input_editor.getValue(),
        "output_text": output_editor.getValue(),
        "console_text": console_editor.getValue(),
        "dissable_editor": false,
    };

    editor.commands.on('afterExec', eventData => {
        if(eventData.command.name === 'insertstring'){
            var source_code = editor.getValue();
            data_set['source_code'] = source_code;
            codeSocket.send(JSON.stringify(data_set))
        }
    });

    input_editor.commands.on('afterExec', eventData => {
        if(eventData.command.name === 'insertstring'){
            var input_text = input_editor.getValue();
            data_set['input_text'] = input_text;
            codeSocket.send(JSON.stringify(data_set))
        }
    });

    $('#language-id').on('change', (event) => {
        var languageID = event.target.value;
        data_set['languageID'] = languageID
        codeSocket.send(JSON.stringify(data_set))
    });

    var setModeObj = {
        "4": "c_cpp",
        "10": "c_cpp",
        "16": "csharp",
        "22": "golang",
        "26": "java",
        "27": "java",
        "29": "javascript",
        "34": "python",
        "43": "text"
    }

    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    $('#language-id').on('change', (event) => {
        var languageID = event.target.value;
        editor.session.setMode("ace/mode/"+setModeObj[languageID]);
    });


    //Submission
    $('#submit-code').click((event) => {
        event.preventDefault();
        $('#submit-code').html("Submitting...");
        $('#submit-code').prop('disabled', true);
        editor.setReadOnly(true);
        data_set['dissable_editor'] = true;
        codeSocket.send(JSON.stringify(data_set));
        var source_code = editor.getValue();
        
        url = "http://sntc.iitmandi.ac.in:3000/submissions/?base64_encoded=false&wait=true";
        body = {
            "source_code": source_code,
            "language_id": $('#language-id').val()
        }
        var stdin = input_editor.getValue();
        if(stdin !== ""){
            body['stdin'] = stdin;
        }

        $.ajax({
            type: 'POST',
            url: url,
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(body),
            success: function(data){
                console.log(data.token);
                $.ajax({
                    type: 'GET',
                    url: "http://sntc.iitmandi.ac.in:3000/submissions/"+data.token+"?base64_encoded=false",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    success: function(data){
                        console.log(data);
                        data_set['dissable_editor'] = false;
                        codeSocket.send(JSON.stringify(data_set))
                        $('#submit-code').prop('disabled', false);
                        $('#submit-code').html("Submit");
                        editor.setReadOnly(false);
                        if(data.stdout !== null){
                            output_editor.setValue(data.stdout);
                            data_set['output_text'] = data.stdout;
                            codeSocket.send(JSON.stringify(data_set))
                            output_editor.setReadOnly(true);
                            output_editor.clearSelection();
                        }
                        var status_text = data.status.description;
                        var stderr = data.stderr;
                        if(status_text!==null){
                            console_editor.setValue("Status: " + status_text);
                            console_editor.clearSelection();
                            data_set['console_text'] = "Status: " + status_text;
                            codeSocket.send(JSON.stringify(data_set));
                            console_editor.setReadOnly(true);
                        }
                        if(stderr !== null){
                            var final_console_text = "Status: "+status_text+"\n\n"+stderr;
                            console_editor.setValue(final_console_text);
                            console_editor.clearSelection();
                            console_editor.setReadOnly(true);
                            data_set['console_text'] = final_console_text;
                            codeSocket.send(JSON.stringify(data_set))
                        }
                        
                    },
                    error: function(e){
                        console.log(e);
                    }
                })
                
            },
            error: function(e){
                console.log(e);
            }
        })
    })

})