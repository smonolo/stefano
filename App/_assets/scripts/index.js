function randomNumber() {
    const number = $('#number');
    const string = $('#string');

    try {
        $.ajax({
            url: 'http://localhost:2345/random-number',
            method: 'GET'
        }).done((data) => {
            number.html(data.number.toString());
            string.html(data.string);
        }).fail(() => {
            number.html('0');
            string.html('A');
        });
    } catch (err) {
        number.html('0');
        string.html('A');
    }
}
