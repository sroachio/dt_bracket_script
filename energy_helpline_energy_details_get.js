async function getDetails () {
  let obj = getResults();
  let powerDetails = [];
  console.log(`Found ${obj.length} results.`);
  for (let i = 0; i < obj.length; i++) {
    console.log(`${i + 1}. Making API call.`)
    await fetch(obj[i].uri, {
      method: 'GET',
      headers: {
        'Origin': 'https://www.energyhelpline.com',
        'Host': 'rest.energyhelpline.com'
      }
    }).then(res => res.json())
      .then((response) => {
        console.log('Parsing JSON');
        console.log('Response', response);
        powerDetails.push({
          index: i,
          type: response.supplies[0].fuel,
          supplier_name: response.supplies[0].supplier.name,
          supplier_tarrif_name: response.supplies[0].supplierTariff.tariffType,
          plan: response.supplies[0].supplierTariff.name,
          rating: response.supplies[0].supplierTariff.unitCharge,
          price_gurantee: getPriceGurantee(response.supplies[0].supplierTariff.features)
        });
        powerDetails.push({
          index: i,
          type: response.supplies[1].fuel,
          supplier_name: response.supplies[1].supplier.name,
          supplier_tarrif_name: response.supplies[1].supplierTariff.tariffType,
          plan: response.supplies[1].supplierTariff.name,
          rating: response.supplies[1].supplierTariff.unitCharge,
          price_gurantee: getPriceGurantee(response.supplies[1].supplierTariff.features)
        })
      })

    function getPriceGurantee (arr) {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].tags === 'CappedOrFixed') {
          return arr[i].text;
        }
      }
      return 'n/a'
    }
  }

  function getResults () {
    const compareElements = document.querySelectorAll('.compare-table-item');
    let compareObj = [];
    // debugger
    for (let i = 0; i < compareElements.length; i++) {
      const personalProjection = compareElements[i].querySelector('fri-result-tariff .compare-projection p').textContent;
      const expectedSaving = compareElements[i].querySelector('.compare-savings .save-total').textContent;
      const queryId = compareElements[i].getAttribute('id');
      compareObj.push({
        projection: personalProjection,
        savings: expectedSaving,
        id: queryId,
        uri: `https://rest.energyhelpline.com/domestic/energy/future-supplies/${queryId}?t=Y-PTbh9VNKo5v9NeDVCx3KgiLDY`
      })
    }
    // console.log(compareObj);
    return compareObj;
  }

  async function deduplicateData (webData, apiData) {
    return new Promise((resolve, reject) => {
      console.log('Deduplicating data..');
      let finalObject = [];
      for (let i = 0; i < webData.length; i++) {
        for (let j = 0; j < apiData.length; j++) {
          if (i === apiData[j].index) {
            finalObject.push({
              'Supplier': apiData[j].supplier_name,
              'Plan': apiData[j].plan,
              'Type': apiData[j].type,
              'Personal Projection': webData[i].projection,
              'Expected Savings': webData[i].savings,
              'Rating': apiData[j].rating,
              'Plan - Tariff Type': apiData[j].supplier_tarrif_name,
              'Plan – Price Guarantee': apiData[j].price_gurantee
            })
          }
        }
      }
      resolve(finalObject);
    });
  }


  console.log('-----------------------------------------------\n           Finished            \n-----------------------------------------------');
  const finalData = await deduplicateData(obj, powerDetails);
  console.log(finalData);
  return this.return(this.createData(finalData));
}

getDetails();
