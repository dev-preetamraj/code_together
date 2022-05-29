$(document).ready(function(){

    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/python");

    var input_editor = ace.edit('input-div');
    // input_editor.setTheme("ace/theme/monokai");
    input_editor.session.setMode("ace/mode/python");

    var output_editor = ace.edit('output-div');
    // output_editor.setTheme("ace/theme/monokai");
    output_editor.session.setMode("ace/mode/python");

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
            "language_id": 34
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
                        output_editor.setValue(data.stdout);
                        output_editor.clearSelection();
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