document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('text');
    const searchBtn = document.getElementById('searchBtn');
    const resultsDiv = document.getElementById('results');

    const API_BASE_URL = 'https://api-colombia.com/swagger/index.html';

    async function searchLocation() {
        const searchTerm = searchInput.value.trim();
        if (!searchTerm) return;

        try {
            // First, try to find as department
            const departments = await fetch(`${API_BASE_URL}/Department`)
                .then(res => res.json());
            
            const department = departments.find(dept => 
                dept.name.toLowerCase() === searchTerm.toLowerCase()
            );

            if (department) {
                // Found a department, get its municipalities
                const municipalities = await fetch(`${API_BASE_URL}/Department/${department.id}/municipalities`)
                    .then(res => res.json());

                displayDepartmentResults(department, municipalities);
                return;
            }

            // If not found as department, try to find as municipality
            const municipalities = await fetch(`${API_BASE_URL}/Municipality`)
                .then(res => res.json());
            
            const municipality = municipalities.find(mun => 
                mun.name.toLowerCase() === searchTerm.toLowerCase()
            );

            if (municipality) {
                // Found a municipality, get its department
                const department = await fetch(`${API_BASE_URL}/Department/${municipality.departmentId}`)
                    .then(res => res.json());

                displayMunicipalityResults(municipality, department);
                return;
            }

            // If nothing found
            displayError('No se encontró el departamento o municipio especificado.');

        } catch (error) {
            console.error('Error:', error);
            displayError('Error al buscar la información. Por favor, intente nuevamente.');
        }
    }

    function displayDepartmentResults(department, municipalities) {
        resultsDiv.innerHTML = `
            <h2>${department.name}</h2>
            <p>Población total: ${department.population?.toLocaleString() || 'No disponible'}</p>
            <h3>Municipios:</h3>
            <div class="municipalities-list">
                ${municipalities.map(mun => `
                    <div class="municipality-item">
                        <strong>${mun.name}</strong>
                        ${mun.population ? `: ${mun.population.toLocaleString()} habitantes` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    function displayMunicipalityResults(municipality, department) {
        resultsDiv.innerHTML = `
            <h2>${municipality.name}</h2>
            <p>Población: ${municipality.population?.toLocaleString() || 'No disponible'}</p>
            <p>Departamento: ${department.name}</p>
        `;
    }

    function displayError(message) {
        resultsDiv.innerHTML = `<p class="error">${message}</p>`;
    }

    // Event listeners
    searchBtn.addEventListener('click', searchLocation);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchLocation();
        }
    });
});