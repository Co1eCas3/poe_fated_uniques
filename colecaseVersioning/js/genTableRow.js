const temp = doc.querySelector('#recipeRow');
const tbody = doc.querySelector('#showData');

CompleteTable.map(rowData => {
  let newRowEl = temp.content.cloneNode(true);

  newRowEl.querySelector('.prophecy__name').textContent = rowData.prophecy;
  newRowEl.querySelector('.ingredient__name').textContent = rowData.ingredient;
  newRowEl.querySelector('.result__name').textContent = rowData.result;
  newRowEl.querySelector('.region').textContent = rowData.region;
  newRowEl.querySelector('.map').textContent = rowData.map;

  tbody.appendChild(newRowEl);
  newRowEl = tbody.lastElementChild;

  return {
    el: newRowEl,
    data: rowData
  }
}).forEach(async ({ el, data }) => {
  const prophecyAmount = await pollForGroupedCell(
    el.querySelector('.prophecy__cell'),
    data.prophecy
  );
  const ingredientAmount = await pollForGroupedCell(
    el.querySelector('.ingredient__cell'),
    data.ingredient
  );
  const resultAmount = await pollForGroupedCell(
    el.querySelector('.result__cell'),
    data.result
  );

  el.querySelector('.profit__cell').textContent = updateProfit(
    prophecyAmount,
    ingredientAmount,
    resultAmount
  );
});

async function pollForGroupedCell(el, item) {
  const data = await PollTradeSite(item);
  const itemAmount = currencyConverter(data.amount);

  el.querySelector(`[class$='amount']`).textContent = itemAmount;
  el.querySelector(`[class$='wiki']`).innerHTML = `
    <a href='${data.wiki_url}'>Wiki</a>
  `;
  el.querySelector(`[class$='trade']`).innerHTML = `
    <a href='${data.trade_url}'>Trade</a>
  `;

  return itemAmount;
}

function updateProfit(prophecyAmount, ingredientAmount, resultAmount) {
  return Math.round(resultAmount - ingredientAmount - prophecyAmount);
}



