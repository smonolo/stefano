function randomNumber() {
    const number = $('#number');
    const string = $('#string');
    const banner = $('#errorBanner');
    const button = $('#button');

    try {
        banner.hide();

        button.html('Generating').toggleClass('disabled').attr('disabled', true);

        $.ajax({
            url: 'http://localhost:2345/random',
            method: 'GET'
        }).done((data) => {
            setTimeout(() => {
                number.html(data.number.toString());
                string.html(data.string);
                button.html('Generate').toggleClass('disabled').attr('disabled', false);
            }, 500);
        }).fail(() => {
            setTimeout(() => {
                setTimeout(() => banner.fadeOut('slow'), 3000);

                button.html('Generate').toggleClass('disabled').attr('disabled', false);
            }, 500);

            banner.html('Whoops! There was an error. Try again in some minutes.').fadeIn('slow');
        });
    } catch (err) {
        console.log('Could not establish connection to API server.');

        setTimeout(() => {
            setTimeout(() => banner.fadeOut('slow'), 3000);

            button.html('Generate').toggleClass('disabled').attr('disabled', false);
        }, 500);

        banner.html('Whoops! There was an error. Try again in some minutes.').fadeIn('slow');
    }
}

function checkAPI() {
    const button = $('#apiButton');
    const successBanner = $('#successBanner');
    const errorBanner = $('#errorBanner');

    try {
        successBanner.hide();
        errorBanner.hide();

        button.html('Checking API status').toggleClass('disabled').attr('disabled', true);

        $.ajax({
            url: 'http://localhost:2345/status',
            method: 'GET'
        }).done((data) => {
            setTimeout(() => {
                setTimeout(() => {
                    if (data.status_code === 1) successBanner.fadeOut('slow');
                    else errorBanner.fadeOut('slow');
                }, 3000);

                button.html('Check API status').toggleClass('disabled').attr('disabled', false);
            }, 500);

            if (data.status_code === 1) {
                successBanner.html('All good! API is working correctly.').fadeIn('slow');
            } else {
                errorBanner.html('Whoops! API is not working correctly. Try again in some minutes.').fadeIn('slow');
            }
        }).fail(() => {
            setTimeout(() => {
                setTimeout(() => errorBanner.fadeOut('slow'), 3000);

                button.html('Check API status').toggleClass('disabled').attr('disabled', false);
            }, 500);

            errorBanner.html('Whoops! API failed to respond. Try again in some minutes.').fadeIn('slow');
        });
    } catch (err) {
        setTimeout(() => {
            setTimeout(() => errorBanner.fadeOut('slow'), 3000);

            button.html('Check API status').toggleClass('disabled').attr('disabled', false);
        }, 500);

        errorBanner.html('Whoops! API failed to respond. Try again in some minutes.').fadeIn('slow');
    }
}

function resetValues() {
    const button = $('#resetButton');
    const number = $('#number');
    const string = $('#string');

    button.html('Resetting').toggleClass('disabled').attr('disabled', true);

    setTimeout(() => button.html('Reset').toggleClass('disabled').attr('disabled', false), 500);

    number.html('0');
    string.html('AaBbCcDdEe');
}