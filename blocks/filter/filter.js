export default function decorate(block) {
  const rows = [...block.children];

  const data = rows.map((row) => {
    const cells = [...row.children];
    return {
      label: cells[0]?.textContent || '',
      filter: cells[1]?.textContent || '',
      iconClass: cells[2]?.textContent || ''
    };
  });

  console.log(data);

  const container = document.createElement('div');
  container.className = 'filter-section';
  container.setAttribute('aria-label', 'Portfolio filters');

  const titleEl = document.createElement('p');
  titleEl.className = 'filter-title';
  titleEl.textContent = data[0]?.label || '';
  container.appendChild(titleEl);

  data.forEach((item, index) => {
    const button  = document.createElement("button");
    button.className = "filter-btn";

    if(index === 0) {
      button.classList.add("active");
    }

    if (item.iconClass) {
      const icon  = document.createElement('i');
      icon.className = item.iconClass;
      button.appendChild(icon);
    }

    const btnText = document.createElement("span");
    btnText.textContent = item.filter;
    button.appendChild(btnText);

    container.appendChild(button);
  });
  block.replaceChildren(container);
}







// export default function decorate(block) {
//   console.log("Filter JS called");
//   console.log(block);
//   const first = block.firstElementChild.children;
//   console.log(first);
//   console.log(first[0].textContent);
//
//   const container = document.createElement('div');
//   container.className = "filter-section";
//   container.setAttribute("aria-label", "Portfolio filters");
//
//   const titleEl = document.createElement("p");
//   titleEl.className = "filter-title";
//   titleEl.textContent = first[0].textContent;
//   container.appendChild(titleEl);
//
//   console.log([...first[1].children]);
//   [...first[1].children].forEach((item) => {
//     const button  = document.createElement("button");
//     button.className = "filter-btn";
//
//     const btnText = document.createElement("span");
//     btnText.textContent = item.textContent;
//
//     button.appendChild(btnText);
//     container.appendChild(button);
//   });
//    block.replaceChildren(container);
// }
