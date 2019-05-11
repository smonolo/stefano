function randomNumber() {
    const number = $('#number');
    const string = $('#string');
    const banner = $('#banner');
    const button = $('#button');

    try {
        button.html('Generating').toggleClass('disabled').attr('disabled', true);

        $.ajax({
            url: 'http://localhost:2345/random-number',
            method: 'GET'
        }).done((data) => {
            setTimeout(() => {
                number.html(data.number.toString());
                string.html(data.string);
                button.html('Generate').toggleClass('disabled').attr('disabled', false);
            }, 500);
        }).fail(() => {
            setTimeout(() => {
                setTimeout(() => {
                    banner.fadeOut('slow');
                }, 2000);

                button.html('Generate').toggleClass('disabled').attr('disabled', false);
            }, 500);

            banner.html('There was an error, try again.').fadeIn('slow');
        });
    } catch (err) {
        setTimeout(() => {
            setTimeout(() => {
                banner.fadeOut('slow');
            }, 2000);

            button.html('Generate').toggleClass('disabled').attr('disabled', false);
        }, 500);

        banner.html('There was an error, try again.').fadeIn('slow');
    }
}
