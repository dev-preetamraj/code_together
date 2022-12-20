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