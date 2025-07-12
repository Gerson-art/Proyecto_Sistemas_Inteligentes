document.addEventListener("DOMContentLoaded", () => {
    const data = {
        name: "¿Tienes hambre?",
        children: [
            {
                name: "Sí",
                children: [
                    {
                        name: "¿Quieres algo ligero?",
                        children: [
                            {
                                name: "Sí",
                                children: [
                                    { name: "🍎 Comer fruta" }
                                ]
                            },
                            {
                                name: "No",
                                children: [
                                    {
                                        name: "¿Quieres cocinar?",
                                        children: [
                                            {
                                                name: "Sí",
                                                children: [
                                                    { name: "🍗 Hacer pollo frito" }
                                                ]
                                            },
                                            {
                                                name: "No",
                                                children: [
                                                    { name: "🍕 Pedir comida a domicilio" }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                name: "No",
                children: [
                    { name: "⏳ Esperar hasta tener hambre" }
                ]
            }
        ]
    };


    // Dimensiones responsive
    const container = document.getElementById('tree-visualization');
    const width = container.clientWidth;
    const height = Math.min(width * 0.4, 400);

    // Configuración del árbol
    const treeLayout = d3.tree().size([height - 100, width - 160]);

    // Jerarquía de datos
    const root = d3.hierarchy(data);
    root.x0 = height / 2;
    root.y0 = 0;

    // Función para colapsar nodos
    function collapse(d) {
        if (d.children && d.depth >= 0) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
    }

    // Colapsar todos los nodos excepto el raíz
    if (root.children) root.children.forEach(collapse);

    // Crear SVG
    const svg = d3.select("#tree-visualization")
        .html("") // Limpiar contenedor
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(47,20)`);

    // Función de actualización
    function update(source) {
        // Calcular nueva disposición
        const treeData = treeLayout(root);

        // Obtener nodos y enlaces
        const nodes = treeData.descendants();
        const links = treeData.links();

        // Ajustar espaciado vertical
        nodes.forEach(d => d.y = d.depth * 120);

        // 1. Manejar enlaces (links)
        const link = svg.selectAll(".link")
            .data(links, d => d.target.id);

        // Eliminar enlaces antiguos
        link.exit().remove();

        // Añadir nuevos enlaces
        link.enter()
            .append("path")
            .attr("class", "link")
            .merge(link)
            .attr("d", d3.linkHorizontal()
                .x(d => d.y)
                .y(d => d.x))
            .attr("stroke", "#95a5a6")
            .attr("stroke-width", 2);

        // 2. Manejar nodos
        const node = svg.selectAll(".node")
            .data(nodes, d => d.id || (d.id = ++i));

        // Eliminar nodos antiguos
        node.exit().remove();

        // Añadir nuevos nodos
        const nodeEnter = node.enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", d => `translate(${source.y0},${source.x0})`)
            .on("click", click);

        // Añadir círculos a los nodos
        nodeEnter.append("circle")
            .attr("r", 10)
            .attr("fill", d => d._children ? "#3498db" : d.children ? "#2ecc71" : "#e74c3c")
            .attr("stroke", "#2c3e50")
            .attr("stroke-width", 2);

        // Añadir texto a los nodos
        nodeEnter.append("text")
            .attr("dy", "2em")
            .attr("x", d => d.children || d._children ? -30 : 5)
            .attr("text-anchor", d => d.children || d._children ? "start" : "start")
            .text(d => d.data.name)
            .style("font-size", "13px")
            .style("fill", "#34495e")
            .style("font-weight", "bold");

        // Combinar y actualizar posición
        node.merge(nodeEnter)
            .transition()
            .duration(500)
            .attr("transform", d => `translate(${d.y},${d.x})`);

        // Actualizar círculos
        node.select("circle")
            .attr("r", 10)
            .attr("fill", d => d._children ? "#3498db" : d.children ? "#2ecc71" : "#e74c3c");
    }

    // Función para manejar clicks
    function click(event, d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        update(d);
    }

    // Botón de reinicio
    document.getElementById("reset-tree").addEventListener("click", () => {
        root.children.forEach(collapse);
        update(root);
    });

    // Variable para IDs
    let i = 0;

    // Dibujar árbol inicial
    update(root);

});



// Tabs de código
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        
        // Remover active de todos
        document.querySelectorAll('.tab-btn, .tab-content').forEach(el => {
            el.classList.remove('active');
        });
        
        // Activar el seleccionado
        btn.classList.add('active');
        document.getElementById(`${tabId}-tab`).classList.add('active');
    });
});