import React, { useState, useEffect } from "react";
import "./ManageComponents.css";

const ManageComponents = ({ selectedSubject }) => {
  const [newSubject, setNewSubject] = useState({
    code: "",
    name: "",
    credits: "",
    type: "central",
  });

  const [totalWeightage, setTotalWeightage] = useState(0);
  const [expandedComponents, setExpandedComponents] = useState({});
  const [weightages, setWeightages] = useState({
    CA: { 
      enabled: false, 
      weightage: 0, 
      totalMarks: 0, 
      selectedCOs: [], 
      subcomponents: [],
      hasSubcomponents: false,
      isExpanded: false
    },
    ESE: { 
      enabled: false, 
      weightage: 0, 
      totalMarks: 0, 
      selectedCOs: [], 
      subcomponents: [],
      hasSubcomponents: false,
      isExpanded: false
    },
    IA: { 
      enabled: false, 
      weightage: 0, 
      totalMarks: 0, 
      selectedCOs: [], 
      subcomponents: [],
      hasSubcomponents: false,
      isExpanded: false
    },
    TW: { 
      enabled: false, 
      weightage: 0, 
      totalMarks: 0, 
      selectedCOs: [], 
      subcomponents: [],
      hasSubcomponents: false,
      isExpanded: false
    },
    VIVA: { 
      enabled: false, 
      weightage: 0, 
      totalMarks: 0, 
      selectedCOs: [], 
      subcomponents: [],
      hasSubcomponents: false,
      isExpanded: false
    },
  });

  const [numCOs, setNumCOs] = useState(0);
  const [courseOutcomes, setCourseOutcomes] = useState([]);
  const [bloomsLevels, setBloomsLevels] = useState([]);
  const [selectedBlooms, setSelectedBlooms] = useState({});

  useEffect(() => {
    // Fetch Blooms Taxonomy levels when component mounts
    const fetchBloomsLevels = async () => {
      try {
        const response = await fetch(
          "http://localhost:5001/api/blooms-taxonomy"
        );
        if (response.ok) {
          const data = await response.json();
          setBloomsLevels(data);
        }
      } catch (error) {
        console.error("Error fetching Blooms Taxonomy levels:", error);
      }
    };
    fetchBloomsLevels();
  }, []);

  const handleSubjectChange = (field, value) => {
    setNewSubject((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const calculateSubcomponentTotal = (subcomponents) => {
    return subcomponents
      .filter(sub => sub.enabled)
      .reduce((total, sub) => total + (parseInt(sub.weightage) || 0), 0);
  };

  const calculateSubcomponentMarksTotal = (subcomponents) => {
    return subcomponents
      .filter(sub => sub.enabled)
      .reduce((total, sub) => total + (parseInt(sub.totalMarks) || 0), 0);
  };

  const handleWeightageChange = (component, field, value) => {
    setWeightages((prev) => {
      const updated = { ...prev };
      if (field === "enabled") {
        updated[component] = { ...updated[component], enabled: value };
      } else if (field === "weightage") {
        const newValue = parseInt(value) || 0;
        updated[component] = { ...updated[component], weightage: newValue };
      } else if (field === "totalMarks") {
        const newValue = parseInt(value) || 0;
        updated[component] = { ...updated[component], totalMarks: newValue };
      }

      const total = Object.values(updated)
        .filter((comp) => comp.enabled)
        .reduce((a, b) => a + b.weightage, 0);
      setTotalWeightage(total);
      return updated;
    });
  };

  const handleSubcomponentChange = (component, subIndex, field, value) => {
    setWeightages((prev) => {
      const updated = { ...prev };
      const componentData = { ...updated[component] };
      const subcomponents = [...componentData.subcomponents];
      
      if (field === "enabled") {
        subcomponents[subIndex] = { ...subcomponents[subIndex], enabled: value };
      } else if (field === "name") {
        subcomponents[subIndex] = { ...subcomponents[subIndex], name: value };
      } else if (field === "weightage") {
        const newValue = parseInt(value) || 0;
        subcomponents[subIndex] = { ...subcomponents[subIndex], weightage: newValue };
      } else if (field === "totalMarks") {
        const newValue = parseInt(value) || 0;
        subcomponents[subIndex] = { ...subcomponents[subIndex], totalMarks: newValue };
      }
      
      componentData.subcomponents = subcomponents;
      
      // Auto-calculate main component weightage and marks from subcomponents
      if (componentData.hasSubcomponents) {
        componentData.weightage = calculateSubcomponentTotal(subcomponents);
        componentData.totalMarks = calculateSubcomponentMarksTotal(subcomponents);
      }
      
      updated[component] = componentData;
      
      const total = Object.values(updated)
        .filter((comp) => comp.enabled)
        .reduce((a, b) => a + b.weightage, 0);
      setTotalWeightage(total);
      return updated;
    });
  };

  const handleSubcomponentCOChange = (component, subIndex, coId, isChecked) => {
    setWeightages((prev) => {
      const updated = { ...prev };
      const componentData = { ...updated[component] };
      const subcomponents = [...componentData.subcomponents];
      const subcomponent = { ...subcomponents[subIndex] };
      
      const currentSelectedCOs = Array.isArray(subcomponent.selectedCOs)
        ? subcomponent.selectedCOs
        : [];
      
      if (isChecked) {
        if (!currentSelectedCOs.includes(coId)) {
          subcomponent.selectedCOs = [...currentSelectedCOs, coId];
        }
      } else {
        subcomponent.selectedCOs = currentSelectedCOs.filter((id) => id !== coId);
      }
      
      subcomponents[subIndex] = subcomponent;
      componentData.subcomponents = subcomponents;
      updated[component] = componentData;
      
      return updated;
    });
  };

  const addSubcomponent = (component) => {
    setWeightages((prev) => {
      const updated = { ...prev };
      const componentData = { ...updated[component] };
      
      const newSubcomponent = {
        id: Date.now(),
        name: '',
        enabled: false,
        weightage: 0,
        totalMarks: 0,
        selectedCOs: []
      };
      
      componentData.subcomponents = [...componentData.subcomponents, newSubcomponent];
      componentData.hasSubcomponents = true;
      componentData.isExpanded = true;
      
      updated[component] = componentData;
      return updated;
    });
  };

  const removeSubcomponent = (component, subIndex) => {
    setWeightages((prev) => {
      const updated = { ...prev };
      const componentData = { ...updated[component] };
      
      const subcomponents = componentData.subcomponents.filter((_, index) => index !== subIndex);
      componentData.subcomponents = subcomponents;
      componentData.hasSubcomponents = subcomponents.length > 0;
      
      // Recalculate main component values
      if (componentData.hasSubcomponents) {
        componentData.weightage = calculateSubcomponentTotal(subcomponents);
        componentData.totalMarks = calculateSubcomponentMarksTotal(subcomponents);
      }
      
      updated[component] = componentData;
      
      const total = Object.values(updated)
        .filter((comp) => comp.enabled)
        .reduce((a, b) => a + b.weightage, 0);
      setTotalWeightage(total);
      
      return updated;
    });
  };

  const toggleComponentExpansion = (component) => {
    setWeightages((prev) => {
      const updated = { ...prev };
      updated[component] = {
        ...updated[component],
        isExpanded: !updated[component].isExpanded
      };
      return updated;
    });
  };

  const handleNumCOsChange = (e) => {
    const countVal = parseInt(e.target.value, 10);

    if (isNaN(countVal) || countVal < 0) {
      setNumCOs(0);
      setCourseOutcomes([]);
      setSelectedBlooms({});
      return;
    }

    // Enforce maximum limit of 10 COs
    if (countVal > 10) {
      alert("Maximum number of COs allowed is 10");
      return;
    }

    setNumCOs(countVal);

    setCourseOutcomes((prevCOs) => {
      const newCOs = [];
      for (let i = 1; i <= countVal; i++) {
        newCOs.push({
          id: `CO${i}`,
          text:
            prevCOs && prevCOs[i - 1] && typeof prevCOs[i - 1].text === "string"
              ? prevCOs[i - 1].text
              : "",
        });
      }
      return newCOs;
    });

    // Reset Blooms selections for new COs
    setSelectedBlooms((prev) => {
      const newSelected = {};
      for (let i = 1; i <= countVal; i++) {
        newSelected[`CO${i}`] = prev[`CO${i}`] || [];
      }
      return newSelected;
    });
  };

  const handleCOTextChange = (index, value) => {
    setCourseOutcomes((prevCOs) => {
      const updatedCOs = [...prevCOs];
      updatedCOs[index] = { ...updatedCOs[index], text: value };
      return updatedCOs;
    });
  };

  const handleComponentCOChange = (componentName, coId, isChecked) => {
    setWeightages((prev) => {
      const updated = { ...prev };
      const component = updated[componentName];
      // Ensure selectedCOs is an array before trying to modify it
      const currentSelectedCOs = Array.isArray(component.selectedCOs)
        ? component.selectedCOs
        : [];
      if (isChecked) {
        // Add coId if not already present
        if (!currentSelectedCOs.includes(coId)) {
          component.selectedCOs = [...currentSelectedCOs, coId];
        }
      } else {
        // Remove coId
        component.selectedCOs = currentSelectedCOs.filter((id) => id !== coId);
      }
      return updated;
    });
  };

  const handleBloomsChange = (coId, bloomsId, isChecked) => {
    setSelectedBlooms((prev) => {
      const currentSelected = prev[coId] || [];
      let newSelected;
      if (isChecked) {
        newSelected = [...currentSelected, bloomsId];
      } else {
        newSelected = currentSelected.filter((id) => id !== bloomsId);
      }
      return {
        ...prev,
        [coId]: newSelected,
      };
    });
  };

  const validateSubcomponentWeightages = () => {
    const errors = [];
    
    Object.entries(weightages).forEach(([componentName, data]) => {
      if (data.enabled && data.hasSubcomponents) {
        const enabledSubcomponents = data.subcomponents.filter(sub => sub.enabled);
        if (enabledSubcomponents.length === 0) {
          errors.push(`${componentName} has no enabled subcomponents`);
        }
        
        // Check if any subcomponent has empty name
        const unnamedSubs = enabledSubcomponents.filter(sub => !sub.name || sub.name.trim() === '');
        if (unnamedSubs.length > 0) {
          errors.push(`${componentName} has unnamed subcomponents`);
        }
      }
    });
    
    return errors;
  };

  const handleSave = async () => {
    if (!newSubject.code || !newSubject.name || !newSubject.credits) {
      alert("Please fill in all subject details");
      return;
    }

    // Validate subcomponents
    const validationErrors = validateSubcomponentWeightages();
    if (validationErrors.length > 0) {
      alert("Validation errors:\n" + validationErrors.join("\n"));
      return;
    }

    // Prepare the data to be sent to the API
    const components = [];

    Object.entries(weightages).forEach(([componentName, data]) => {
      if (data.enabled) {
        const componentData = {
          name: componentName,
          weightage: data.weightage,
          totalMarks: data.totalMarks,
          selectedCOs: data.selectedCOs || [],
        };
        
        // Add subcomponents if they exist
        if (data.hasSubcomponents && data.subcomponents.length > 0) {
          componentData.subcomponents = data.subcomponents
            .filter(sub => sub.enabled)
            .map(sub => ({
              name: sub.name,
              weightage: sub.weightage,
              totalMarks: sub.totalMarks,
              selectedCOs: sub.selectedCOs || []
            }));
        }
        
        components.push(componentData);
      }
    });

    const payload = {
      subject: newSubject.code,
      name: newSubject.name,
      credits: Number(newSubject.credits),
      type: newSubject.type,
      components: components,
      courseOutcomes: courseOutcomes.filter(
        (co) => co.text && co.text.trim() !== ""
      ),
      bloomsTaxonomy: selectedBlooms,
    };

    try {
      console.log("Sending data:", JSON.stringify(payload, null, 2));

      // Call the API endpoint to add subject with components
      const response = await fetch(
        "http://localhost:5001/api/subjects/addSubjectWithComponents",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      console.log("API Response:", data);

      if (response.ok) {
        alert(
          "Subject, components, course outcomes, and Blooms Taxonomy levels added successfully!"
        );

        // Reset form
        setNewSubject({
          code: "",
          name: "",
          credits: "",
          type: "central",
        });
        setWeightages({
          CA: { 
            enabled: false, 
            weightage: 0, 
            totalMarks: 0, 
            selectedCOs: [], 
            subcomponents: [],
            hasSubcomponents: false,
            isExpanded: false
          },
          ESE: { 
            enabled: false, 
            weightage: 0, 
            totalMarks: 0, 
            selectedCOs: [], 
            subcomponents: [],
            hasSubcomponents: false,
            isExpanded: false
          },
          IA: { 
            enabled: false, 
            weightage: 0, 
            totalMarks: 0, 
            selectedCOs: [], 
            subcomponents: [],
            hasSubcomponents: false,
            isExpanded: false
          },
          TW: { 
            enabled: false, 
            weightage: 0, 
            totalMarks: 0, 
            selectedCOs: [], 
            subcomponents: [],
            hasSubcomponents: false,
            isExpanded: false
          },
          VIVA: {
            enabled: false,
            weightage: 0,
            totalMarks: 0,
            selectedCOs: [],
            subcomponents: [],
            hasSubcomponents: false,
            isExpanded: false
          },
        });
        setTotalWeightage(0);
        setNumCOs(0);
        setCourseOutcomes([]);
        setSelectedBlooms({});
      } else {
        console.error("API Error:", {
          status: response.status,
          statusText: response.statusText,
          data: data,
        });
        alert(
          `Failed to add subject: ${data.error || data.details?.join("\n") || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("Error adding subject:", error);
      alert(`Error adding subject: ${error.message}`);
    }
  };

  return (
    <div className="manage-weightage-container">
      <div className="subject-form">
        <div className="form-inputs form-inputs-inline">
          <h3>Add New Subject</h3>
          <input
            type="text"
            placeholder="Subject Code"
            value={newSubject.code}
            onChange={(e) => handleSubjectChange("code", e.target.value)}
            className="subject-input"
          />
          <input
            type="text"
            placeholder="Subject Name"
            value={newSubject.name}
            onChange={(e) => handleSubjectChange("name", e.target.value)}
            className="subject-input"
          />
          <input
            type="number"
            placeholder="Credits"
            value={newSubject.credits}
            onChange={(e) => handleSubjectChange("credits", e.target.value)}
            className="subject-input"
          />
          <select
            value={newSubject.type}
            onChange={(e) => handleSubjectChange("type", e.target.value)}
            className="subject-input"
          >
            <option value="central">Central</option>
            <option value="department">Departmental</option>
          </select>
        </div>
      </div>

      <div className="course-outcomes-section">
        <h3>Course Outcomes (COs)</h3>
        <div className="co-input-group">
          <label htmlFor="numCOs">Number of COs:</label>
          <input
            type="number"
            id="numCOs"
            min="0"
            max="10"
            value={numCOs}
            onChange={handleNumCOsChange}
            className="subject-input"
          />
        </div>
        {courseOutcomes.map((co, index) => (
          <div key={co.id} className="co-item">
            <label htmlFor={`co-${index}`}>{co.id}:</label>
            <input
              type="text"
              id={`co-${index}`}
              placeholder={`Enter description for ${co.id}`}
              value={co.text}
              onChange={(e) => handleCOTextChange(index, e.target.value)}
              className="subject-input"
            />
            <div className="blooms-taxonomy-section">
              <h4>Blooms Taxonomy Levels</h4>
              <div className="blooms-checkboxes">
                {bloomsLevels.map((level) => (
                  <div key={level.id} className="blooms-checkbox-item">
                    <input
                      type="checkbox"
                      id={`${co.id}-blooms-${level.id}`}
                      checked={
                        selectedBlooms[co.id]?.includes(level.id) || false
                      }
                      onChange={(e) =>
                        handleBloomsChange(co.id, level.id, e.target.checked)
                      }
                      disabled={!co.text || co.text.trim() === ""}
                    />
                    <label htmlFor={`${co.id}-blooms-${level.id}`}>
                      {level.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="components-area">
        <h3>Subject Components</h3>

        <table className="weightage-table">
          <thead>
            <tr>
              <th>Enable</th>
              <th>Component</th>
              <th>Weightage (%)</th>
              <th>Total Marks</th>
              <th>COs</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(weightages).map(([component, data]) => (
              <React.Fragment key={component}>
                {/* Main Component Row */}
                <tr className="main-component-row">
                  <td>
                    <input
                      type="checkbox"
                      className="component-checkbox"
                      checked={data.enabled}
                      onChange={(e) =>
                        handleWeightageChange(
                          component,
                          "enabled",
                          e.target.checked
                        )
                      }
                    />
                  </td>
                  <td>
                    <div className="component-name-container">
                      {data.hasSubcomponents && (
                        <button
                          type="button"
                          className="expand-toggle"
                          onClick={() => toggleComponentExpansion(component)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            marginRight: '8px',
                            fontSize: '12px'
                          }}
                        >
                          {data.isExpanded ? '▼' : '▶'}
                        </button>
                      )}
                      {component === "CA"
                        ? "Continuous Semester Evolution (CSE)"
                        : component === "ESE"
                          ? "End Semester Exam (ESE)"
                          : component === "IA"
                            ? "Internal Assessment (IA)"
                            : component === "TW"
                              ? "Term Work (TW)"
                              : "Viva"}
                    </div>
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="weightage-input"
                      value={data.weightage}
                      disabled={!data.enabled || data.hasSubcomponents}
                      onChange={(e) =>
                        handleWeightageChange(
                          component,
                          "weightage",
                          e.target.value
                        )
                      }
                      style={{
                        backgroundColor: data.hasSubcomponents ? '#f5f5f5' : 'white'
                      }}
                    />
                    {data.hasSubcomponents && (
                      <small style={{ display: 'block', color: '#666', fontSize: '10px' }}>
                        Auto-calculated
                      </small>
                    )}
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      className="marks-input"
                      value={data.totalMarks}
                      disabled={!data.enabled || data.hasSubcomponents}
                      onChange={(e) =>
                        handleWeightageChange(
                          component,
                          "totalMarks",
                          e.target.value
                        )
                      }
                      style={{
                        backgroundColor: data.hasSubcomponents ? '#f5f5f5' : 'white'
                      }}
                    />
                    {data.hasSubcomponents && (
                      <small style={{ display: 'block', color: '#666', fontSize: '10px' }}>
                        Auto-calculated
                      </small>
                    )}
                  </td>
                  <td className="co-selection-cell co-selection-cell-inline">
                    {data.enabled &&
                      courseOutcomes.length > 0 &&
                      !data.hasSubcomponents &&
                      courseOutcomes.map((co) => (
                        <div
                          key={`${component}-${co.id}`}
                          className="co-checkbox-item"
                        >
                          <input
                            type="checkbox"
                            id={`${component}-${co.id}`}
                            checked={data.selectedCOs.includes(co.id)}
                            onChange={(e) =>
                              handleComponentCOChange(
                                component,
                                co.id,
                                e.target.checked
                              )
                            }
                            disabled={!co.text || co.text.trim() === ""}
                          />
                          <label
                            htmlFor={`${component}-${co.id}`}
                            title={co.text || "CO not defined"}
                          >
                            {co.id}
                          </label>
                        </div>
                      ))}
                    {data.enabled && courseOutcomes.length === 0 && !data.hasSubcomponents && (
                      <small>No COs defined</small>
                    )}
                    {!data.enabled && (
                      <small>Enable component to assign COs</small>
                    )}
                    {data.hasSubcomponents && (
                      <small style={{ color: '#666' }}>Defined in subcomponents</small>
                    )}
                  </td>
                  <td>
                    {data.enabled && (
                      <button
                        type="button"
                        className="add-subcomponent-btn"
                        onClick={() => addSubcomponent(component)}
                        style={{
                          background: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        + Add Subcomponent
                      </button>
                    )}
                  </td>
                </tr>
                
                {/* Subcomponent Rows */}
                {data.enabled && data.hasSubcomponents && data.isExpanded && 
                  data.subcomponents.map((subcomponent, subIndex) => (
                    <tr key={`${component}-sub-${subIndex}`} className="subcomponent-row" style={{ backgroundColor: '#f9f9f9' }}>
                      <td style={{ paddingLeft: '30px' }}>
                        <input
                          type="checkbox"
                          className="component-checkbox"
                          checked={subcomponent.enabled}
                          onChange={(e) =>
                            handleSubcomponentChange(
                              component,
                              subIndex,
                              "enabled",
                              e.target.checked
                            )
                          }
                        />
                      </td>
                      <td style={{ paddingLeft: '30px' }}>
                        <input
                          type="text"
                          placeholder="Subcomponent name"
                          value={subcomponent.name}
                          onChange={(e) =>
                            handleSubcomponentChange(
                              component,
                              subIndex,
                              "name",
                              e.target.value
                            )
                          }
                          disabled={!subcomponent.enabled}
                          style={{
                            border: '1px solid #ddd',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            width: '100%'
                          }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className="weightage-input"
                          value={subcomponent.weightage}
                          disabled={!subcomponent.enabled}
                          onChange={(e) =>
                            handleSubcomponentChange(
                              component,
                              subIndex,
                              "weightage",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          className="marks-input"
                          value={subcomponent.totalMarks}
                          disabled={!subcomponent.enabled}
                          onChange={(e) =>
                            handleSubcomponentChange(
                              component,
                              subIndex,
                              "totalMarks",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td className="co-selection-cell co-selection-cell-inline">
                        {subcomponent.enabled &&
                          courseOutcomes.length > 0 &&
                          courseOutcomes.map((co) => (
                            <div
                              key={`${component}-sub-${subIndex}-${co.id}`}
                              className="co-checkbox-item"
                            >
                              <input
                                type="checkbox"
                                id={`${component}-sub-${subIndex}-${co.id}`}
                                checked={subcomponent.selectedCOs.includes(co.id)}
                                onChange={(e) =>
                                  handleSubcomponentCOChange(
                                    component,
                                    subIndex,
                                    co.id,
                                    e.target.checked
                                  )
                                }
                                disabled={!co.text || co.text.trim() === ""}
                              />
                              <label
                                htmlFor={`${component}-sub-${subIndex}-${co.id}`}
                                title={co.text || "CO not defined"}
                              >
                                {co.id}
                              </label>
                            </div>
                          ))}
                        {subcomponent.enabled && courseOutcomes.length === 0 && (
                          <small>No COs defined</small>
                        )}
                        {!subcomponent.enabled && (
                          <small>Enable subcomponent to assign COs</small>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="remove-subcomponent-btn"
                          onClick={() => removeSubcomponent(component, subIndex)}
                          style={{
                            background: '#f44336',
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                }
              </React.Fragment>
            ))}
          </tbody>
        </table>

        <div className="weightage-summary">
          <p>Total Weightage: {totalWeightage}%</p>
          
          {/* Show subcomponent weightage breakdown */}
          {Object.entries(weightages).some(([_, data]) => data.enabled && data.hasSubcomponents) && (
            <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
              <strong>Subcomponent Breakdown:</strong>
              {Object.entries(weightages)
                .filter(([_, data]) => data.enabled && data.hasSubcomponents)
                .map(([component, data]) => {
                  const subTotal = calculateSubcomponentTotal(data.subcomponents);
                  const componentName = component === "CA" ? "CSE" : component;
                  return (
                    <div key={component} style={{ marginLeft: '10px', fontSize: '12px' }}>
                      {componentName}: {subTotal}% (from {data.subcomponents.filter(sub => sub.enabled).length} subcomponents)
                    </div>
                  );
                })
              }
            </div>
          )}
        </div>

        {totalWeightage !== 100 && (
          <div style={{ color: "red", textAlign: "right", marginTop: "5px" }}>
            Total weightage must be 100%
          </div>
        )}

        <div className="last-button">
          <button
            onClick={handleSave}
            className="save-weightage-btn"
            disabled={
              totalWeightage !== 100 ||
              !newSubject.code ||
              !newSubject.name ||
              !newSubject.credits
            }
          >
            Add Subject
          </button>
        </div>
      </div>

    </div>
  );
};

export default ManageComponents;
