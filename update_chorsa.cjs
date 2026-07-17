const fs = require('fs');

let code = fs.readFileSync('src/pages/Chorsa999.jsx', 'utf8');
const dialog0 = fs.readFileSync('dialog_0.jsx', 'utf8');
const dialog1 = fs.readFileSync('dialog_1.jsx', 'utf8');
const dialog2 = fs.readFileSync('dialog_2.jsx', 'utf8');

const formModalProps = `
      <PakkiFormModal 
        modalOpen={modalOpen}
        handleCloseModal={handleCloseModal}
        editingChorsa={editingChorsa}
        formData={formData}
        setFormData={setFormData}
        parties={parties}
        partySearchQuery={partySearchQuery}
        setPartySearchQuery={setPartySearchQuery}
        partySearchResults={partySearchResults}
        formPendingPakkiGroups={formPendingPakkiGroups}
        loadingFormPending={loadingFormPending}
        expandedFormGroups={expandedFormGroups}
        setExpandedFormGroups={setExpandedFormGroups}
        handleInputChange={handleInputChange}
        handleSaveChorsa={handleSaveChorsa}
        formatDate={formatDate}
        pageTitle={pageTitle}
      />
`;

const deleteModalProps = `
      <PakkiDeleteModal 
        deleteConfirmationOpen={deleteConfirmationOpen}
        handleCancelDelete={handleCancelDelete}
        handleConfirmDelete={handleConfirmDelete}
      />
`;

const bhavcutModalProps = `
      <PakkiBhavcutModal 
        bhavcutModalOpen={bhavcutModalOpen}
        setBhavcutModalOpen={setBhavcutModalOpen}
        formData={formData}
        bhavcutWeight={bhavcutWeight}
        bhavcutDate={bhavcutDate}
        setBhavcutDate={setBhavcutDate}
        bhavcutRate={bhavcutRate}
        setBhavcutRate={setBhavcutRate}
        handleBhavcutSubmit={handleBhavcutSubmit}
        pageTitle={pageTitle}
      />
`;

// Also we need to add imports to Chorsa999.jsx
const imports = `
import PakkiFormModal from '../components/Chorsa999/PakkiFormModal';
import PakkiDeleteModal from '../components/Chorsa999/PakkiDeleteModal';
import PakkiBhavcutModal from '../components/Chorsa999/PakkiBhavcutModal';
`;

code = code.replace("import { gradients } from '../theme';", "import { gradients } from '../theme';" + imports);
code = code.replace(dialog0, formModalProps);
code = code.replace(dialog1, deleteModalProps);
code = code.replace(dialog2, bhavcutModalProps);

fs.writeFileSync('src/pages/Chorsa999.jsx', code);
console.log('Chorsa999.jsx updated with modal components!');
