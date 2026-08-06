import React, { useState, useEffect } from 'react';
import { 
  Sliders, Plus, Trash2, Edit3, Check, X, Search, Layers, FolderTree, FileCode, CheckSquare, 
  HelpCircle, Settings, ChevronRight, ChevronDown, ArrowUp, ArrowDown, Save, Sparkles, Filter, Eye
} from 'lucide-react';
import { SpecFieldType, SpecGroup, Specification, SpecTemplate, StoreCategory } from '../../types';
import { 
  getStoredSpecGroups, saveStoredSpecGroups,
  getStoredSpecifications, saveStoredSpecifications,
  getStoredSpecTemplates, saveStoredSpecTemplates
} from '../../services/dataStorage';
import { buildCategoryTree } from '../../utils/categoryUtils';

interface SpecificationManagerProps {
  storeCategories: StoreCategory[];
  showToast: (msg: string, type?: 'info' | 'error' | 'success') => void;
  openDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

const FIELD_TYPES: SpecFieldType[] = [
  'Text', 'Textarea', 'Number', 'Decimal', 'Dropdown', 'Multi Select',
  'Yes / No', 'Checkbox', 'Radio Button', 'Date', 'URL', 'File Upload',
  'Numeric Range', 'Color'
];

const COMMON_UNITS = [
  'MHz', 'GHz', 'kHz', 'Hz',
  'KB', 'MB', 'GB', 'TB', 'Bytes',
  'V', 'mV', 'µV', 'kV',
  'A', 'mA', 'µA',
  'Ω', 'kΩ', 'MΩ', 'mΩ',
  'pF', 'nF', 'µF', 'mF', 'F',
  'W', 'mW', 'kW',
  '°C', '°F',
  'mm', 'cm', 'm', 'inch',
  'g', 'kg', 'mg',
  '%'
];

export const SpecificationManager: React.FC<SpecificationManagerProps> = ({
  storeCategories,
  showToast,
  openDeleteConfirm,
}) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'dictionary' | 'groups' | 'mappings'>('templates');

  // Core Data States
  const [specGroups, setSpecGroups] = useState<SpecGroup[]>(() => getStoredSpecGroups());
  const [specifications, setSpecifications] = useState<Specification[]>(() => getStoredSpecifications());
  const [specTemplates, setSpecTemplates] = useState<SpecTemplate[]>(() => getStoredSpecTemplates());

  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Editing States
  // 1. Group Modal
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<SpecGroup | null>(null);

  // 2. Spec Modal
  const [specModalOpen, setSpecModalOpen] = useState(false);
  const [editingSpec, setEditingSpec] = useState<Specification | null>(null);
  const [specOptionsInput, setSpecOptionsInput] = useState('');
  const [allowedUnitsInput, setAllowedUnitsInput] = useState('');

  // 3. Template Modal
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SpecTemplate | null>(null);

  // Sync effect across windows/tabs
  useEffect(() => {
    const syncData = () => {
      setSpecGroups(getStoredSpecGroups());
      setSpecifications(getStoredSpecifications());
      setSpecTemplates(getStoredSpecTemplates());
    };
    window.addEventListener('ohmveda_spec_groups_updated', syncData);
    window.addEventListener('ohmveda_specifications_updated', syncData);
    window.addEventListener('ohmveda_spec_templates_updated', syncData);

    return () => {
      window.removeEventListener('ohmveda_spec_groups_updated', syncData);
      window.removeEventListener('ohmveda_specifications_updated', syncData);
      window.removeEventListener('ohmveda_spec_templates_updated', syncData);
    };
  }, []);

  // GROUP HANDLERS
  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup || !editingGroup.name.trim()) {
      showToast('Group name is required.', 'error');
      return;
    }

    let updated: SpecGroup[];
    if (specGroups.some(g => g.id === editingGroup.id)) {
      updated = specGroups.map(g => g.id === editingGroup.id ? editingGroup : g);
    } else {
      updated = [...specGroups, editingGroup];
    }

    setSpecGroups(updated);
    saveStoredSpecGroups(updated);
    setGroupModalOpen(false);
    setEditingGroup(null);
    showToast('Specification group saved successfully.', 'success');
  };

  const handleDeleteGroup = (id: string, name: string) => {
    openDeleteConfirm('Delete Specification Group', `Are you sure you want to delete group "${name}"?`, () => {
      const updated = specGroups.filter(g => g.id !== id);
      setSpecGroups(updated);
      saveStoredSpecGroups(updated);
      showToast(`Group "${name}" deleted.`, 'info');
    });
  };

  // SPECIFICATION DICTIONARY HANDLERS
  const handleOpenNewSpec = () => {
    const defaultGroup = specGroups[0]?.id || 'group_general';
    setEditingSpec({
      id: `spec_${Date.now()}`,
      groupId: defaultGroup,
      name: '',
      code: '',
      fieldType: 'Text',
      isRequired: false,
      isFilterable: true,
      isSearchable: true,
      isSortable: false,
      isCompareEnabled: true,
      showOnProductCard: false,
      showOnProductDetails: true,
      order: specifications.length + 1,
    });
    setSpecOptionsInput('');
    setAllowedUnitsInput('');
    setSpecModalOpen(true);
  };

  const handleOpenEditSpec = (spec: Specification) => {
    setEditingSpec({ ...spec });
    setSpecOptionsInput(spec.options ? spec.options.join(', ') : '');
    setAllowedUnitsInput(spec.allowedUnits ? spec.allowedUnits.join(', ') : '');
    setSpecModalOpen(true);
  };

  const handleSaveSpec = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpec || !editingSpec.name.trim()) {
      showToast('Specification name is required.', 'error');
      return;
    }

    const codeClean = editingSpec.code.trim() 
      ? editingSpec.code.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_')
      : editingSpec.name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');

    const optionsArr = ['Dropdown', 'Multi Select', 'Radio Button'].includes(editingSpec.fieldType)
      ? specOptionsInput.split(',').map(s => s.trim()).filter(Boolean)
      : undefined;

    const unitsArr = allowedUnitsInput.trim()
      ? allowedUnitsInput.split(',').map(u => u.trim()).filter(Boolean)
      : undefined;

    const finalSpec: Specification = {
      ...editingSpec,
      code: codeClean,
      options: optionsArr,
      allowedUnits: unitsArr,
    };

    let updated: Specification[];
    if (specifications.some(s => s.id === finalSpec.id)) {
      updated = specifications.map(s => s.id === finalSpec.id ? finalSpec : s);
    } else {
      updated = [...specifications, finalSpec];
    }

    setSpecifications(updated);
    saveStoredSpecifications(updated);
    setSpecModalOpen(false);
    setEditingSpec(null);
    showToast('Specification field saved successfully.', 'success');
  };

  const handleDeleteSpec = (id: string, name: string) => {
    openDeleteConfirm('Delete Specification', `Are you sure you want to delete specification "${name}"?`, () => {
      const updated = specifications.filter(s => s.id !== id);
      setSpecifications(updated);
      saveStoredSpecifications(updated);
      showToast(`Specification "${name}" deleted.`, 'info');
    });
  };

  // TEMPLATE HANDLERS
  const handleOpenNewTemplate = () => {
    setEditingTemplate({
      id: `tpl_${Date.now()}`,
      name: '',
      description: '',
      categoryIds: [],
      specifications: [],
    });
    setTemplateModalOpen(true);
  };

  const handleOpenEditTemplate = (tpl: SpecTemplate) => {
    setEditingTemplate({ ...tpl });
    setTemplateModalOpen(true);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate || !editingTemplate.name.trim()) {
      showToast('Template name is required.', 'error');
      return;
    }

    let updated: SpecTemplate[];
    if (specTemplates.some(t => t.id === editingTemplate.id)) {
      updated = specTemplates.map(t => t.id === editingTemplate.id ? editingTemplate : t);
    } else {
      updated = [...specTemplates, editingTemplate];
    }

    setSpecTemplates(updated);
    saveStoredSpecTemplates(updated);
    setTemplateModalOpen(false);
    setEditingTemplate(null);
    showToast('Specification template saved successfully.', 'success');
  };

  const handleDeleteTemplate = (id: string, name: string) => {
    openDeleteConfirm('Delete Specification Template', `Are you sure you want to delete template "${name}"?`, () => {
      const updated = specTemplates.filter(t => t.id !== id);
      setSpecTemplates(updated);
      saveStoredSpecTemplates(updated);
      showToast(`Template "${name}" deleted.`, 'info');
    });
  };

  // Category Assignment Handler directly from Mappings Tab
  const handleAssignCategoryToTemplate = (categoryId: string, templateId: string) => {
    const updated = specTemplates.map((t) => {
      if (t.id === templateId) {
        if (!t.categoryIds.includes(categoryId)) {
          return { ...t, categoryIds: [...t.categoryIds, categoryId] };
        }
      } else {
        // Remove category from other templates to maintain clean 1:1 binding
        return { ...t, categoryIds: t.categoryIds.filter(id => id !== categoryId) };
      }
      return t;
    });

    setSpecTemplates(updated);
    saveStoredSpecTemplates(updated);
    showToast('Category template binding updated successfully!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                Electronics Specification Engine
              </h1>
              <p className="text-xs text-slate-500">
                Manage reusable specification templates, parameter dictionary, units, and dynamic category filter rules.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'templates' && (
            <button
              onClick={handleOpenNewTemplate}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Specification Template</span>
            </button>
          )}

          {activeTab === 'dictionary' && (
            <button
              onClick={handleOpenNewSpec}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Specification Field</span>
            </button>
          )}

          {activeTab === 'groups' && (
            <button
              onClick={() => {
                setEditingGroup({
                  id: `group_${Date.now()}`,
                  name: '',
                  description: '',
                  order: specGroups.length + 1,
                });
                setGroupModalOpen(true);
              }}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Specification Group</span>
            </button>
          )}
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'templates'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Specification Templates ({specTemplates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('mappings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'mappings'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Category-Template Bindings</span>
        </button>

        <button
          onClick={() => setActiveTab('dictionary')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'dictionary'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Parameter Dictionary ({specifications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('groups')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'groups'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Specification Groups ({specGroups.length})</span>
        </button>
      </div>

      {/* TAB 1: SPECIFICATION TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {specTemplates.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                      {tpl.specifications.length} Parameters Assigned
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditTemplate(tpl)}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded cursor-pointer"
                        title="Edit Template"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(tpl.id, tpl.name)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                        title="Delete Template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{tpl.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{tpl.description || 'No description provided.'}</p>
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assigned Categories ({tpl.categoryIds.length})</p>
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                    {tpl.categoryIds.length === 0 ? (
                      <span className="text-[10px] text-slate-400 italic">No categories assigned</span>
                    ) : (
                      tpl.categoryIds.map((catId) => {
                        const cat = storeCategories.find(c => c.id === catId);
                        return (
                          <span key={catId} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] rounded font-medium">
                            {cat ? cat.label : catId}
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORY - TEMPLATE BINDINGS */}
      {activeTab === 'mappings' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-blue-600" />
              <span>Category to Specification Template Assignment Matrix</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select which specification template applies when adding products to each store category.
            </p>
          </div>

          <div className="space-y-3">
            {buildCategoryTree(storeCategories).map((mainCat) => {
              const assignedTpl = specTemplates.find(t => t.categoryIds.includes(mainCat.id));

              return (
                <div key={mainCat.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">📁 {mainCat.label}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Level 0</span>
                    </div>

                    <select
                      value={assignedTpl ? assignedTpl.id : ''}
                      onChange={(e) => handleAssignCategoryToTemplate(mainCat.id, e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                    >
                      <option value="">-- No Template Assigned --</option>
                      {specTemplates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* SUBCATEGORIES BINDING */}
                  {mainCat.subcategories.map((subCat) => {
                    const subTpl = specTemplates.find(t => t.categoryIds.includes(subCat.id));

                    return (
                      <div key={subCat.id} className="ml-4 pl-3 border-l-2 border-blue-200 flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-xs font-semibold text-slate-800">📂 {subCat.label}</span>
                        <select
                          value={subTpl ? subTpl.id : (assignedTpl ? assignedTpl.id : '')}
                          onChange={(e) => handleAssignCategoryToTemplate(subCat.id, e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                        >
                          <option value="">-- Inherit or None --</option>
                          {specTemplates.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: PARAMETER DICTIONARY */}
      {activeTab === 'dictionary' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search parameters by name or code..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-xs"
            />
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Parameter Name</th>
                    <th className="py-3 px-4">Group</th>
                    <th className="py-3 px-4">Field Type</th>
                    <th className="py-3 px-4">Units</th>
                    <th className="py-3 px-4">Flags</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {specifications
                    .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.code.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((spec) => {
                      const group = specGroups.find(g => g.id === spec.groupId);

                      return (
                        <tr key={spec.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-bold text-slate-900">{spec.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">code: {spec.code}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold">
                              {group ? group.name : 'General'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-bold">
                              {spec.fieldType}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                            {spec.allowedUnits ? spec.allowedUnits.join(', ') : (spec.defaultUnit || 'N/A')}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              {spec.isFilterable && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9px] font-bold border border-emerald-200" title="Filterable in Store">
                                  Filterable
                                </span>
                              )}
                              {spec.showOnProductCard && (
                                <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 text-[9px] font-bold border border-purple-200" title="Show on Product Card">
                                  Card
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenEditSpec(spec)}
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteSpec(spec.id, spec.name)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SPECIFICATION GROUPS */}
      {activeTab === 'groups' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="space-y-3">
            {specGroups.map((group) => (
              <div key={group.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{group.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">Order: {group.order}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{group.description || 'No group description.'}</p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingGroup({ ...group });
                      setGroupModalOpen(true);
                    }}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group.id, group.name)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: SPECIFICATION FIELD MODAL */}
      {specModalOpen && editingSpec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {specifications.some(s => s.id === editingSpec.id) ? 'Edit Specification Field' : 'Create Specification Field'}
              </h3>
              <button onClick={() => setSpecModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSpec} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Field Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Voltage, Bit Width"
                  value={editingSpec.name}
                  onChange={(e) => setEditingSpec({ ...editingSpec, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Specification Group</label>
                  <select
                    value={editingSpec.groupId}
                    onChange={(e) => setEditingSpec({ ...editingSpec, groupId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                  >
                    {specGroups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Field Input Type</label>
                  <select
                    value={editingSpec.fieldType}
                    onChange={(e) => setEditingSpec({ ...editingSpec, fieldType: e.target.value as SpecFieldType })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                  >
                    {FIELD_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {['Dropdown', 'Multi Select', 'Radio Button'].includes(editingSpec.fieldType) && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Allowed Options (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. 8-bit, 16-bit, 32-bit"
                    value={specOptionsInput}
                    onChange={(e) => setSpecOptionsInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Allowed Units (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. MHz, GHz, kHz"
                  value={allowedUnitsInput}
                  onChange={(e) => setAllowedUnitsInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 bg-slate-50 border border-slate-200 rounded-xl p-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingSpec.isFilterable}
                    onChange={(e) => setEditingSpec({ ...editingSpec, isFilterable: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Filterable</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingSpec.isRequired}
                    onChange={(e) => setEditingSpec({ ...editingSpec, isRequired: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Required Field</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingSpec.isSearchable}
                    onChange={(e) => setEditingSpec({ ...editingSpec, isSearchable: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Searchable</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingSpec.isSortable}
                    onChange={(e) => setEditingSpec({ ...editingSpec, isSortable: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Sortable</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingSpec.isCompareEnabled}
                    onChange={(e) => setEditingSpec({ ...editingSpec, isCompareEnabled: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Compare Enabled</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingSpec.showOnProductCard}
                    onChange={(e) => setEditingSpec({ ...editingSpec, showOnProductCard: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Show on Product Card</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingSpec.showOnProductDetails}
                    onChange={(e) => setEditingSpec({ ...editingSpec, showOnProductDetails: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Show on Details Page</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSpecModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500"
                >
                  Save Specification Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TEMPLATE EDIT MODAL */}
      {templateModalOpen && editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {specTemplates.some(t => t.id === editingTemplate.id) ? 'Edit Specification Template' : 'Create Specification Template'}
              </h3>
              <button onClick={() => setTemplateModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Template Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Microcontrollers (MCUs)"
                  value={editingTemplate.name}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Short description of component family..."
                  value={editingTemplate.description || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                />
              </div>

              {/* SPECIFICATIONS CHECKLIST */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Select Included Parameters ({editingTemplate.specifications.length})</label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-60 overflow-y-auto space-y-2">
                  {specifications.map((s) => {
                    const isChecked = editingTemplate.specifications.some(item => item.specId === s.id);

                    return (
                      <label key={s.id} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200 text-xs cursor-pointer">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditingTemplate({
                                  ...editingTemplate,
                                  specifications: [...editingTemplate.specifications, { specId: s.id, isRequired: false, isFilterable: s.isFilterable }],
                                });
                              } else {
                                setEditingTemplate({
                                  ...editingTemplate,
                                  specifications: editingTemplate.specifications.filter(item => item.specId !== s.id),
                                });
                              }
                            }}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className="font-bold text-slate-900">{s.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{s.fieldType}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setTemplateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500"
                >
                  Save Specification Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: GROUP EDIT MODAL */}
      {groupModalOpen && editingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {specGroups.some(g => g.id === editingGroup.id) ? 'Edit Group' : 'Create Group'}
              </h3>
              <button onClick={() => setGroupModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Group Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electrical Characteristics"
                  value={editingGroup.name}
                  onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={editingGroup.description || ''}
                  onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setGroupModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500"
                >
                  Save Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
