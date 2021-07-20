const postcodeForm = document.forms[0]
const userPostcode = document.getElementById('userPostcode')
const lastUpdate = document.getElementById('lastUpdate')
const numCrimes = document.getElementById('numCrimes')
const statsHidden = document.getElementById('statsHidden')

postcodeForm.addEventListener('submit', (e) => {
    e.preventDefault()
    new FormData(postcodeForm)
})

postcodeForm.addEventListener('formdata', (e) => {
    const postcode = e.formData.get('postcode')

    userPostcode.innerText = postcode

    const getLatLong = 'https://api.postcodes.io/postcodes/' + encodeURIComponent(postcode)

    fetch(getLatLong)
        .then(
            response => response.json())
        .then(
            postcodeData => {
                let lat = postcodeData.result.latitude
                let long = postcodeData.result.longitude

                const getCrimes = 'https://data.police.uk/api/crimes-street/all-crime?lat=' + lat + '&lng=' + long

                fetch(getCrimes)
                    .then(response => response.json())
                    .then(crimeData => {

                        lastUpdate.innerText = new Date(crimeData[0].month).toLocaleDateString(
                            'en-gb',
                            {
                                year: 'numeric',
                                month: 'long',
                            }
                        )

                        numCrimes.innerText = crimeData.length.toString()

                        let categories = Object.values(crimeData.reduce((obj, { category }) => {
                            if (obj[category] === undefined)
                                obj[category] = { category: category, count: 1 };
                            else
                                obj[category].count++;
                            return obj;
                        }, {}));

                        let options = {
                            chart: {
                                type: 'pie'
                            },
                            dataLabels: {
                                enabled: false
                            },
                            series: [],
                            labels: [],
                            noData: {
                                text: 'Loading...'
                            },
                            total: {
                                show: false
                            }
                        }

                        let crimeType = new ApexCharts(document.getElementById('crimeTypeChart'), options)

                        crimeType.render()

                        let crimes = []
                        let crimeCat = []

                        for (let i = 0; i < categories.length; i++) {
                            crimes.push(categories[i].count)
                            crimeCat.push(categories[i].category.replace(/-/g, ' '))
                        }

                        crimeType.updateOptions({labels: crimeCat})
                        crimeType.updateSeries(crimes)

                        statsHidden.id = 'statsVisible'

                    })
                    .catch(console.error)
            }
        )
        .catch(console.error)
})