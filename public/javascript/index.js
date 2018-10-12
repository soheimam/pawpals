//fetch breeds json and populates the select dropdown

let dropdown = document.getElementById('breeds');
dropdown.length = 0;

let defaultOption = document.createElement('option');
defaultOption.text = 'Choose Dog Breed';

dropdown.add(defaultOption);
dropdown.selectedIndex = 0;

const url = '/assets/json/breeds.json';

fetch(url)
  .then(response => {
    if (response.status !== 200) {
      console.warn(
        'Looks like there was a problem. Status Code: ' + response.status
      );
      return;
    }
    // Examine the text in the response
    response.json().then(data => {
      let option;
      data.dogs.forEach(dog => {
        option = document.createElement('option');
        option.text = dog;
        option.value = dog;
        dropdown.add(option);
      });
    });
  })
  .catch(function(err) {
    console.error('Fetch Error -', err);
  });
