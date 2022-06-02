$(document).ready(function(){

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
    
    
    var console_editor = ace.edit('status-div')

    var input_editor = ace.edit('input-div');
    // input_editor.setTheme("ace/theme/monokai");
    input_editor.session.setMode("ace/mode/text");

    var output_editor = ace.edit('output-div');
    // output_editor.setTheme("ace/theme/monokai");
    output_editor.session.setMode("ace/mode/text");

    //Submission
    $('#submit-code').click((event) => {
        event.preventDefault();
        $('#submit-code').html("Submitting...");
        $('#submit-code').prop('disabled', true);
        editor.setReadOnly(true);
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
                        $('#submit-code').prop('disabled', false);
                        $('#submit-code').html("Submit");
                        editor.setReadOnly(false);
                        if(data.stdout !== null){
                            output_editor.setValue(data.stdout);
                            output_editor.setReadOnly(true);
                            output_editor.clearSelection();
                        }
                        var status_text = data.status.description;
                        var stderr = data.stderr;
                        if(status_text!==null){
                            console_editor.setValue("Status: " + status_text);
                            console_editor.clearSelection();
                            console_editor.setReadOnly(true);
                        }
                        if(stderr !== null){
                            var final_console_text = "Status: "+status_text+"\n\n"+stderr;
                            console_editor.setValue(final_console_text);
                            console_editor.clearSelection();
                            console_editor.setReadOnly(true);
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

    $('#chat-btn').click((event) => {
        event.preventDefault();
        $('#chat-div').show();
    });

    $('#chat-close').click((event) => {
        event.preventDefault();
        $('#chat-div').hide();
    });

    $('#clear-editor').click((event) => {
        event.preventDefault();
        if(confirm("Are you sure you want to clear the Editor?")){
            editor.setValue("");
        }
    });

    $('#user-close').click((event) => {
        event.preventDefault();
        $('#user-div').hide();
    })

    $('#show-user').click((event) => {
        event.preventDefault();
        $('#user-div').show();
    })

    $('#wboard-close').click((event) => {
        event.preventDefault();
        $('#draw').hide();
    });
    
    $('#show-wboard').click((event) => {
        event.preventDefault();
        $('#draw').show();
    })
})