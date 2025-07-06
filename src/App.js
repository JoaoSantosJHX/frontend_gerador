import React, { useState } from 'react';
import './App.css';
import logo from './itau.jpeg'
function App() {
  const [tableName, setTableName] = useState('');
  const [numRows, setNumRows] = useState(10);
  const [columns, setColumns] = useState([{ name: '', type: 'UTF8' }]);
  const [fileName, setFileName] = useState('');

  const [useManualValues, setUseManualValues] = useState(false);
  const [manualValues, setManualValues] = useState([]);

  const handleColumnChange = (index, field, value) => {
    const newColumns = [...columns];
    newColumns[index][field] = value;
    setColumns(newColumns);
  };

  const addColumn = () => {
    setColumns([...columns, { name: '', type: 'UTF8' }]);
  };

  const removeColumn = (index) => {
    const newColumns = columns.filter((_, i) => i !== index);
    setColumns(newColumns);
  };

  const addManualField = () => {
    setManualValues([...manualValues, { field: '', value: '', numRows: 1 }]);
  };

  const handleManualChange = (index, field, value) => {
    const updated = [...manualValues];
    updated[index][field] = value;
    setManualValues(updated);
  };

  const removeManualField = (index) => {
    const updated = manualValues.filter((_, i) => i !== index);
    setManualValues(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFileName('');
    const payload = { tableName, numRows, columns };

    if (useManualValues && manualValues.length > 0) {
      payload.manualValues = manualValues;
    }

    try {
      const response = await fetch('http://localhost:4000/api/gerar-parquet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.fileName) {
        setFileName(data.fileName);
      } else if (data.error) {
        alert('Erro: ' + data.error);
      }
    } catch (err) {
      alert('Erro na requisição: ' + err.message);
    }
  };

  return (
    <div className="App">
      <img
        src={logo}
        alt="Logo"
        style={{ maxWidth: '200px', display: 'block', margin: '0 auto 1rem auto' }}
      />
      <h2>Gerador de Massa</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nome da Tabela:</label>
          <input
            type="text"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            required
            autoComplete="off"
          />
        </div>

        <div className="form-group">
          <label>Número de Linhas:</label>
          <input
            type="number"
            value={numRows}
            onChange={(e) => setNumRows(parseInt(e.target.value) || 0)}
            required
            min={1}
          />
        </div>

        <div className="form-group">
          <h4>Campos</h4>
          {columns.map((col, index) => (
            <div
              key={index}
              className="form-group row-flex"
            >
              <input
                type="text"
                placeholder="Nome do Campo"
                value={col.name}
                onChange={(e) => handleColumnChange(index, 'name', e.target.value)}
                required
                autoComplete="off"
                style={{ flex: 2 }}
              />
              <select
                value={col.type}
                onChange={(e) => handleColumnChange(index, 'type', e.target.value)}
                style={{ flex: 1 }}
              >
                <option value="UTF8">Texto</option>
                <option value="INT64">Inteiro</option>
                <option value="DOUBLE">Decimal</option>
              </select>
              <button type="button" onClick={() => removeColumn(index)} style={{}}>
                Remover
              </button>
            </div>
          ))}
          <button type="button" onClick={addColumn}>
            Adicionar Campo
          </button>
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={useManualValues}
              onChange={(e) => setUseManualValues(e.target.checked)}
            />
            Deseja especificar dados manualmente?
          </label>
        </div>

        {useManualValues && (
          <div className="form-group">
            <h4>Campos com dados manuais</h4>
            {manualValues.map((mv, index) => (
              <div key={index} className="manual-field">
                <select
                  value={mv.field}
                  onChange={(e) => handleManualChange(index, 'field', e.target.value)}
                  required
                  style={{ marginBottom: '0.5rem' }}
                >
                  <option value="">Selecione o campo</option>
                  {columns.map((col, i) => (
                    <option key={i} value={col.name}>
                      {col.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Valor fixo"
                  value={mv.value}
                  onChange={(e) => handleManualChange(index, 'value', e.target.value)}
                  required
                  style={{ marginBottom: '0.5rem' }}
                  autoComplete="off"
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Qtd Linhas"
                  value={mv.numRows}
                  onChange={(e) => handleManualChange(index, 'numRows', parseInt(e.target.value) || 1)}
                  required
                  style={{ marginBottom: '0.5rem' }}
                />
                <button type="button" onClick={() => removeManualField(index)}>
                  Remover
                </button>
              </div>
            ))}
            <button type="button" onClick={addManualField}>
              Adicionar Campo Manual
            </button>
          </div>
        )}

        <div className="form-group">
          <button type="submit">Gerar Parquet</button>
        </div>
      </form>

      {fileName && (
        <div style={{ marginTop: '1rem' }}>
          <a
            href={`http://localhost:4000/api/download/${fileName}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#FF6600', fontWeight: '600' }}
          >
            Baixar Arquivo Gerado
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
