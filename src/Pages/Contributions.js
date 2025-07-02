import React, { useState, useEffect, useContext, useCallback} from 'react';
import { 
  Container, Row, Col, Card, Form, Button, 
  Modal, Badge, Spinner, Alert, Table,
  InputGroup, Dropdown, ButtonGroup, FormControl
} from 'react-bootstrap';
import { 
  FiDollarSign, FiPlus, FiTrash2, 
  FiCheckCircle, FiXCircle, FiDownload, 
  FiSearch, FiUser, FiClock, FiUsers, FiPrinter, FiRefreshCw, FiCheck
} from 'react-icons/fi';
import { useOutletContext } from 'react-router-dom';
import { ChamaContext } from '../App';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, getDoc, getDocs, doc, updateDoc, onSnapshot} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';


const Contributions = () => {
  useOutletContext();
  const { activeChama } = useContext(ChamaContext);
  const auth = getAuth();
  
  // State for UI and modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    memberId: '',
    memberName: '',
    type: 'Monthly',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'M-Pesa',
    reference: '',
    status: 'Pending',
    notes: ''
  });

  const [bulkFormData, setBulkFormData] = useState({
    type: 'Monthly',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'M-Pesa',
    contributions: []
  });

  // Data states
  const [contributions, setContributions] = useState([]);
  const [members, setMembers] = useState([]);
  const [filteredContributions, setFilteredContributions] = useState([]);

  const isAdmin = activeChama?.isAdmin || false;

  // REPLACE your existing extractMemberName function with this enhanced version
  const extractMemberName = useCallback((memberData) => {
    if (!memberData) return 'Unknown Member';
    
    console.log('=== EXTRACTING NAME FROM MEMBER DATA ===');
    console.log('Full member data:', memberData);
    
    // Priority order for name fields (including invitation-specific fields)
    const nameFields = [
      'name',
      'displayName', 
      'fullName',
      'userName',
      'inviteeName',
      'inviteeDisplayName',
      'firstName',
      'lastName'
    ];
    
    // Try each name field
    for (const field of nameFields) {
      if (memberData[field] && typeof memberData[field] === 'string' && memberData[field].trim()) {
        const name = memberData[field].trim();
        // Avoid generic/auto-generated names
        if (!name.toLowerCase().includes('member') && !name.match(/^[a-zA-Z0-9]{8,}$/)) {
          console.log(`Found name in field '${field}':`, name);
          return name;
        }
      }
    }
    
    // If firstName and lastName exist separately, combine them
    if (memberData.firstName || memberData.lastName) {
      const firstName = (memberData.firstName || '').trim();
      const lastName = (memberData.lastName || '').trim();
      const combinedName = `${firstName} ${lastName}`.trim();
      if (combinedName && combinedName !== ' ') {
        console.log('Combined firstName and lastName:', combinedName);
        return combinedName;
      }
    }
    
    // Try to extract from email (but make it more readable)
    const emailFields = ['email', 'inviteeEmail', 'invitedUserEmail', 'userEmail'];
    for (const emailField of emailFields) {
      if (memberData[emailField]) {
        const email = memberData[emailField];
        const emailName = email.split('@')[0];
        // Convert camelCase or underscore to readable format
        const formattedEmailName = emailName
          .replace(/[._]/g, ' ')
          .replace(/([a-z])([A-Z])/g, '$1 $2')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        
        if (formattedEmailName && formattedEmailName.length > 2) {
          console.log('Extracted name from email:', formattedEmailName);
          return formattedEmailName;
        }
      }
    }
    
    // Check for phone number as fallback
    const phoneFields = ['phone', 'phoneNumber', 'mobile', 'mobileNumber'];
    for (const phoneField of phoneFields) {
      if (memberData[phoneField]) {
        const phone = memberData[phoneField];
        console.log('Using phone number as name:', phone);
        return `Contact ${phone}`;
      }
    }
    
    // Last resort - use email or a more descriptive fallback
    const fallbackEmail = memberData.email || memberData.inviteeEmail || memberData.invitedUserEmail;
    if (fallbackEmail) {
      return fallbackEmail;
    }
    
    return 'Unknown Member';
  }, []);


  // Enhanced data fetching function that mimics the Members component approach
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!activeChama?.id) {
        setError('No active chama selected');
        setLoading(false);
        return;
      }
      
      console.log('Fetching data for Chama ID:', activeChama.id);
      
      let allMembers = [];
      
      try {
        // Fetch from memberships collection (accepted members)
        const membershipsQuery = query(
          collection(db, 'memberships'),
          where('chamaId', '==', activeChama.id)
        );
        const membershipsSnapshot = await getDocs(membershipsQuery);
        
        if (membershipsSnapshot.size > 0) {
          console.log('Found members in memberships collection:', membershipsSnapshot.size);
          
          // Process memberships with user data lookup (like in Members component)
          const membershipsData = await Promise.all(
            membershipsSnapshot.docs.map(async (memberDoc) => {
              const memberData = memberDoc.data();
              const memberEmail = memberData.email || memberData.invitedUserEmail || memberData.userEmail;
              const memberUserId = memberData.userId || memberData.uid;
              
              // Try to get additional user data
              let userData = {};
              
              if (memberUserId) {
                try {
                  const userDoc = await getDoc(doc(db, 'users', memberUserId));
                  if (userDoc.exists()) {
                    userData = userDoc.data();
                  }
                } catch (error) {
                  console.log('Could not fetch user data for userId:', memberUserId);
                }
              }
              
              // If no userData yet and we have email, try email query
              if (Object.keys(userData).length === 0 && memberEmail) {
                try {
                  const userQuery = query(
                    collection(db, 'users'),
                    where('email', '==', memberEmail)
                  );
                  const userSnapshot = await getDocs(userQuery);
                  if (!userSnapshot.empty) {
                    userData = userSnapshot.docs[0].data();
                  }
                } catch (error) {
                  console.log('Could not fetch user data for email:', memberEmail);
                }
              }
              
              return {
                id: memberDoc.id,
                ...memberData,
                // Enhanced name resolution
                name: memberData.name || 
                      memberData.displayName || 
                      userData.name || 
                      userData.displayName || 
                      userData.firstName || 
                      userData.fullName ||
                      (memberEmail ? memberEmail.split('@')[0] : 'Unknown User'),
                email: memberEmail || userData.email || 'No email available',
                phone: userData.phone || memberData.phone || userData.phoneNumber || '',
                source: 'memberships',
                docId: memberDoc.id,
                status: memberData.status || 'active',
                userData: userData
              };
            })
          );
          
          allMembers = [...allMembers, ...membershipsData];
        }
        
        // Also fetch pending invitations (like in Members component)
        const invitationsQuery = query(
          collection(db, 'invitations'),
          where('chamaId', '==', activeChama.id),
          where('status', '==', 'pending')
        );
        const invitationsSnapshot = await getDocs(invitationsQuery);
        
        if (invitationsSnapshot.size > 0) {
          console.log('Found invitations:', invitationsSnapshot.size);
          
          const invitationsData = await Promise.all(
            invitationsSnapshot.docs.map(async (inviteDoc) => {
              const inviteData = inviteDoc.data();
              const inviteEmail = inviteData.email || inviteData.invitedUserEmail || inviteData.inviteeEmail;
              
              let userData = {};
              if (inviteEmail) {
                try {
                  const userQuery = query(
                    collection(db, 'users'),
                    where('email', '==', inviteEmail)
                  );
                  const userSnapshot = await getDocs(userQuery);
                  if (!userSnapshot.empty) {
                    userData = userSnapshot.docs[0].data();
                  }
                } catch (error) {
                  console.log('Could not fetch user data for invitation email:', inviteEmail);
                }
              }
              
              return {
                id: inviteDoc.id,
                ...inviteData,
                name: userData.name || userData.displayName || inviteEmail || 'Pending Invitation',
                email: inviteEmail,
                phone: userData.phone || '',
                source: 'invitations',
                docId: inviteDoc.id,
                status: 'pending',
                userData: userData
              };
            })
          );
          
          allMembers = [...allMembers, ...invitationsData];
        }
        
        // Fallback to other collections if needed
        if (allMembers.length === 0) {
          const fallbackCollections = ['chamaMembers', 'members'];
          
          for (const collectionName of fallbackCollections) {
            const fallbackQuery = query(
              collection(db, collectionName),
              where('chamaId', '==', activeChama.id)
            );
            const fallbackSnapshot = await getDocs(fallbackQuery);
            
            if (fallbackSnapshot.size > 0) {
              console.log(`Found members in ${collectionName} collection:`, fallbackSnapshot.size);
              const fallbackData = fallbackSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                source: collectionName,
                docId: doc.id
              }));
              allMembers = [...allMembers, ...fallbackData];
              break;
            }
          }
        }
        
      } catch (memberError) {
        console.error('Error fetching members:', memberError);
        setError('Failed to load members');
      }
      
      // Process members with enhanced name extraction
      const processedMembers = allMembers.map(member => {
        const extractedName = extractMemberName(member);
        console.log(`Processing member ${member.id}:`, {
          originalData: member,
          extractedName: extractedName,
          source: member.source
        });
        
        return {
          id: member.id,
          userId: member.userId,
          docId: member.docId,
          name: extractedName,
          email: member.email,
          phone: member.phone,
          status: member.status,
          role: member.role,
          source: member.source,
          isActive: member.status === 'accepted' || member.status === 'active' || member.status === 'pending' || !member.status,
          rawData: member
        };
      });
      
      // Filter for active members (including pending invitations)
      const activeMembers = processedMembers.filter(member => {
        return member.status !== 'removed' &&
              member.status !== 'deleted' &&
              member.status !== 'inactive' &&
              member.status !== 'banned' &&
              member.status !== 'left';
      });
      
      // Sort members by name
      activeMembers.sort((a, b) => a.name.localeCompare(b.name));
      
      console.log('Final processed active members:', activeMembers);
      setMembers(activeMembers);

      // Fetch contributions (existing code)
      try {
        const contributionsQuery = query(
          collection(db, 'contributions'),
          where('chamaId', '==', activeChama.id)
        );
        const contributionsSnapshot = await getDocs(contributionsQuery);
        const contributionsData = contributionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('Contributions loaded:', contributionsData.length);
        setContributions(contributionsData);
      } catch (contributionsError) {
        console.error('Error fetching contributions:', contributionsError);
        setError('Failed to load contributions');
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(`Failed to load data: ${error.message}`);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [activeChama?.id, extractMemberName]);

  // Load data on component mount and when activeChama changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);
 
  // Apply filters and search
  useEffect(() => {
    let result = contributions;
    
    // Apply status filter
    if (filter !== 'all') {
      result = result.filter(c => c.status === filter);
    }
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c => 
        (c.memberName && c.memberName.toLowerCase().includes(term)) || 
        (c.reference && c.reference.toLowerCase().includes(term)) ||
        (c.type && c.type.toLowerCase().includes(term))
      );  
    }
    
    setFilteredContributions(result);
  }, [contributions, filter, searchTerm]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle bulk form changes
  const handleBulkInputChange = (e) => {
    const { name, value } = e.target;
    setBulkFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Enhanced member selection handler
  const handleMemberSelect = (memberId) => {
    console.log('Selecting member with ID:', memberId);
    
    setError('');
    
    if (!memberId || memberId === '') {
      setFormData(prev => ({
        ...prev,
        memberId: '',
        memberName: ''
      }));
      return;
    }
    
    const selectedMember = members.find(m => 
      m.id === memberId || 
      m.userId === memberId || 
      m.docId === memberId
    );
    
    console.log('Found member:', selectedMember);
    
    if (selectedMember) {
      const memberName = selectedMember.name;
      
      // Validate that we have a proper name
      if (!memberName || memberName === 'Unknown Member' || memberName.startsWith('Member ')) {
        console.warn('Selected member has incomplete name data:', memberName);
        setError('Warning: This member may not have complete profile information');
      }
      
      setFormData(prev => ({
        ...prev,
        memberId: selectedMember.id || selectedMember.docId,
        memberName: memberName
      }));
      
      console.log('Member selected successfully:', { id: selectedMember.id, name: memberName });
    } else {
      console.warn('Member not found for ID:', memberId);
      setError('Selected member not found. Please refresh and try again.');
    }
  };

  // Real-time updates with proper cleanup
  useEffect(() => {
    if (!activeChama?.id) return;

    const unsubscribeFunctions = [];

    // Set up real-time listeners for member collections
    const memberCollections = ['memberships', 'chamaMembers'];
    
    memberCollections.forEach(collectionName => {
      try {
        const q = query(
          collection(db, collectionName),
          where('chamaId', '==', activeChama.id)
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          console.log(`Real-time update from ${collectionName}:`, snapshot.size, 'documents');
          
          // Check if any documents were removed or status changed
          const changes = snapshot.docChanges();
          const hasRelevantChanges = changes.some(change => 
            change.type === 'removed' || 
            (change.type === 'modified')
          );
          
          if (hasRelevantChanges) {
            console.log('Detected member changes, refreshing member list...');
            // Use a timeout to debounce multiple rapid changes
            setTimeout(() => {
              fetchData();
            }, 1000);
          }
        }, (error) => {
          console.warn(`Error listening to ${collectionName}:`, error);
        });
        
        unsubscribeFunctions.push(unsubscribe);
      } catch (error) {
        console.warn(`Failed to set up listener for ${collectionName}:`, error);
      }
    });

    // Cleanup function
    return () => {
      unsubscribeFunctions.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, [activeChama?.id, fetchData]);

  // Add a new contribution
  const handleAddContribution = async () => {
    if (!isAdmin) {
      setError('Only admins can add contributions');
      return;
    }

    // Validate form
    if (!formData.memberId || !formData.amount || !formData.reference) {
      setError('Please fill all required fields (Member, Amount, Reference)');
      return;
    }

    if (!formData.memberName) {
      setError('Please select a valid member');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, 'contributions'), {
        ...formData,
        chamaId: activeChama.id,
        chamaName: activeChama.name,
        amount: parseFloat(formData.amount),
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser.uid,
        createdByName: auth.currentUser.displayName || 'Admin'
      });

      // Update local state
      const newContribution = {
        id: docRef.id,
        ...formData,
        amount: parseFloat(formData.amount),
        createdAt: new Date().toISOString()
      };
      
      setContributions(prev => [...prev, newContribution]);
      setShowAddModal(false);
      setFormData({
        memberId: '',
        memberName: '',
        type: 'Monthly',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'M-Pesa',
        reference: '',
        status: 'Pending',
        notes: ''
      });
      
      toast.success('Contribution recorded successfully!');
      
      // Show receipt
      setReceiptData(newContribution);
      setShowReceiptModal(true);
      
    } catch (error) {
      console.error('Error adding contribution:', error);
      setError(`Failed to record contribution: ${error.message}`);
      toast.error('Failed to record contribution');
    } finally {
      setLoading(false);
    }
  };

  // Record bulk contributions (e.g., monthly contributions for all members)
  const handleBulkContributions = async () => {
    if (!isAdmin) {
      setError('Only admins can record bulk contributions');
      return;
    }

    if (bulkFormData.contributions.length === 0) {
      setError('Please add at least one contribution');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Add each contribution to Firestore
      const newContributions = [];
      
      for (const contrib of bulkFormData.contributions) {
        if (!contrib.amount || !contrib.memberName) {
          continue; // Skip invalid contributions
        }

        const docRef = await addDoc(collection(db, 'contributions'), {
          ...bulkFormData,
          memberId: contrib.memberId,
          memberName: contrib.memberName,
          amount: parseFloat(contrib.amount),
          reference: contrib.reference || `BULK-${Date.now()}-${contrib.memberId}`,
          chamaId: activeChama.id,
          chamaName: activeChama.name,
          createdAt: serverTimestamp(),
          createdBy: auth.currentUser.uid,
          createdByName: auth.currentUser.displayName || 'Admin'
        });
        
        newContributions.push({
          id: docRef.id,
          ...bulkFormData,
          memberId: contrib.memberId,
          memberName: contrib.memberName,
          amount: parseFloat(contrib.amount),
          reference: contrib.reference || `BULK-${Date.now()}-${contrib.memberId}`,
          createdAt: new Date().toISOString()
        });
      }
      
      // Update local state
      setContributions(prev => [...prev, ...newContributions]);
      setShowBulkModal(false);
      setBulkFormData({
        type: 'Monthly',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'M-Pesa',
        contributions: []
      });
      
      toast.success(`${newContributions.length} contributions recorded successfully!`);
      
    } catch (error) {
      console.error('Error adding bulk contributions:', error);
      setError(`Failed to record contributions: ${error.message}`);
      toast.error('Failed to record contributions');
    } finally {
      setLoading(false);
    }
  };

  // Add member to bulk contribution list
  const addMemberToBulkList = (memberId) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    
    const exists = bulkFormData.contributions.some(c => c.memberId === memberId);
    if (exists) return;
    
    setBulkFormData(prev => ({
      ...prev,
      contributions: [
        ...prev.contributions,
        {
          memberId,
          memberName: member.name,
          amount: '',
          reference: ''
        }
      ]
    }));
  };

  // Update bulk contribution amount
  const updateBulkContribution = (index, field, value) => {
    const updated = [...bulkFormData.contributions];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    
    setBulkFormData(prev => ({
      ...prev,
      contributions: updated
    }));
  };

  // Remove member from bulk list
  const removeFromBulkList = (index) => {
    const updated = bulkFormData.contributions.filter((_, i) => i !== index);
    setBulkFormData(prev => ({
      ...prev,
      contributions: updated
    }));
  };

  // Generate receipt PDF
  const generateReceipt = (contribution) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text(`${activeChama.name} - Contribution Receipt`, 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Receipt #: ${contribution.reference}`, 20, 40);
    doc.text(`Date: ${new Date(contribution.date).toLocaleDateString()}`, 20, 50);
    doc.text(`Member: ${contribution.memberName}`, 20, 60);
    
    // Line
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 70, 190, 70);
    
    // Contribution details
    doc.setFontSize(14);
    doc.text('Contribution Details', 20, 80);
    
    doc.setFontSize(12);
    doc.text(`Type: ${contribution.type}`, 20, 90);
    doc.text(`Amount: Ksh ${contribution.amount.toLocaleString()}`, 20, 100);
    doc.text(`Payment Method: ${contribution.paymentMethod}`, 20, 110);
    
    if (contribution.notes) {
      doc.text(`Notes: ${contribution.notes}`, 20, 120);
    }
    
    // Footer
    doc.setFontSize(10);
    doc.text('Thank you for your contribution!', 105, 150, { align: 'center' });
    doc.text('Generated by ChamaPro', 105, 280, { align: 'center' });
    
    return doc;
  };

  // Download receipt
  const downloadReceipt = () => {
    if (!receiptData) return;
    const doc = generateReceipt(receiptData);
    doc.save(`receipt-${receiptData.reference}.pdf`);
  };

  // Print receipt
  const printReceipt = () => {
    if (!receiptData) return;
    const doc = generateReceipt(receiptData);
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  };

  // Calculate stats
  const stats = {
    total: contributions.length,
    totalAmount: contributions.reduce((sum, c) => sum + c.amount, 0),
    pending: contributions.filter(c => c.status === 'Pending').length,
    pendingAmount: contributions.filter(c => c.status === 'Pending').reduce((sum, c) => sum + c.amount, 0),
    verified: contributions.filter(c => c.status === 'Verified').length,
    verifiedAmount: contributions.filter(c => c.status === 'Verified').reduce((sum, c) => sum + c.amount, 0)
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contributions...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !activeChama?.id) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Status badge variant
  const statusVariant = (status) => {
    switch(status) {
      case 'Verified': return 'success';
      case 'Pending': return 'warning';
      case 'Rejected': return 'danger';
      default: return 'secondary';
    }
  };

  // Download PDF function
  const downloadPDF = (filterType) => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(18);
      doc.text(`${activeChama.name} - Contributions Report`, 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);
      doc.text(`Report Type: ${filterType === 'all' ? 'All Contributions' : 'Filtered Contributions'}`, 20, 40);
      
      // Line
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 45, 190, 45);
      
      // Get the data to export based on filter
      const dataToExport = filterType === 'all' ? contributions : filteredContributions;
      
      // Table header
      const headers = ['Date', 'Member', 'Type', 'Amount', 'Method', 'Reference', 'Status'];
      let y = 55;
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      headers.forEach((header, index) => {
        doc.text(header, 20 + (index * 25), y);
      });
      
      // Table content
      doc.setFont(undefined, 'normal');
      y += 10;
      
      dataToExport.forEach(item => {
        const row = [
          new Date(item.date).toLocaleDateString(),
          item.memberName.substring(0, 10),
          item.type,
          `Ksh ${item.amount.toLocaleString()}`,
          item.paymentMethod,
          item.reference.substring(0, 10),
          item.status
        ];
        
        row.forEach((cell, index) => {
          doc.text(String(cell), 20 + (index * 25), y);
        });
        
        y += 8;
        
        // New page if needed
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });
      
      // Footer
      doc.setFontSize(10);
      doc.text(`Total: Ksh ${dataToExport.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}`, 20, y + 10);
      doc.text('Generated by ChamaPro', 105, 280, { align: 'center' });
      
      // Save the PDF
      doc.save(`${activeChama.name}-contributions-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  // Handle status change
  const handleStatusChange = async (id, newStatus) => {
    if (!isAdmin) {
      toast.error('Only admins can change contribution status');
      return;
    }
    
    try {
      setLoading(true);
      
      // Update in Firestore
      const contribRef = doc(db, 'contributions', id);
      await updateDoc(contribRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser.uid,
        updatedByName: auth.currentUser.displayName || 'Admin'
      });
      
      // Update local state
      setContributions(prev => 
        prev.map(c => 
          c.id === id ? { ...c, status: newStatus } : c
        )
      );
      
      toast.success(`Contribution marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  // Debug function for testing collections
  const testCollections = async () => {
    const collections = [
      'memberships',
      'members', 
      'chamaInvitations',
      'invitations',
      'users',
      'chamaMembers'
    ];
    
    console.log('=== TESTING COLLECTIONS ===');
    console.log('Chama ID:', activeChama?.id);
    
    for (const collectionName of collections) {
      try {
        // Test 1: Get all documents
        const allQuery = query(collection(db, collectionName));
        const allSnapshot = await getDocs(allQuery);
        console.log(`${collectionName} - Total docs: ${allSnapshot.size}`);
        
        // Test 2: Get documents with chamaId
        if (activeChama?.id) {
          const chamaQuery = query(
            collection(db, collectionName),
            where('chamaId', '==', activeChama.id)
          );
          const chamaSnapshot = await getDocs(chamaQuery);
          console.log(`${collectionName} - With chamaId: ${chamaSnapshot.size}`);
          
          // Log first document structure
          if (chamaSnapshot.size > 0) {
            const firstDoc = chamaSnapshot.docs[0].data();
            console.log(`${collectionName} - Sample:`, firstDoc);
          }
        }
      } catch (error) {
        console.log(`${collectionName} - Error:`, error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Data</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={() => window.location.reload()}>
            <FiRefreshCw className="me-2" />
            Retry
          </Button>
          {process.env.NODE_ENV === 'development' && (
            <Button variant="outline-info" onClick={testCollections} className="ms-2">
              Test Collections
            </Button>
          )}
        </Alert>
      </Container>
    );
  }

  // Debug info (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('Current members state:', members);
    console.log('Members for dropdown:', members.map(m => ({ id: m.id, name: m.name })));
  }

  return (
    <Container fluid className="py-4">
      {/* Page Heading */}
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">Contributions</h2>
          <p className="text-muted">Track and manage all chama contributions</p>
        </Col>
      </Row>

      {/* Stats Cards - Updated Version */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="bg-info bg-opacity-10 p-3 rounded">
                  <FiDollarSign size={24} className="text-primary" />
                </div>
                <div className="text-end">
                  <h4 className="mb-0">Ksh {stats.totalAmount.toLocaleString()}</h4>
                  <small className="text-muted">Total Contributions</small>
                </div>
              </div>
              <div className="text-start">
                <small className="text-success">
                  <FiCheckCircle className="me-1" />
                  Ksh {stats.verifiedAmount.toLocaleString()} verified
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <FiCheckCircle size={24} className="text-success" />
                </div>
                <div className="text-end">
                  <h4 className="mb-0">{stats.verified}</h4>
                  <small className="text-muted">Verified Contributions</small>
                </div>
              </div>
              <div className="text-start">
                <small className="text-muted">Completed contributions</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <FiClock size={24} className="text-warning" />
                </div>
                <div className="text-end">
                  <h4 className="mb-0">{stats.pending}</h4>
                  <small className="text-muted">Pending Contributions</small>
                </div>
              </div>
              <div className="text-start">
                <small className="text-muted">Awaiting verification</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="bg-info bg-opacity-10 p-3 rounded">
                  <FiUsers size={24} className="text-info" />
                </div>
                <div className="text-end">
                  <h4 className="mb-0">{members.length}</h4>
                  <small className="text-muted">Active Members</small>
                </div>
              </div>
              <div className="text-start">
                <small className="text-muted">Members with transactions</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Controls */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <FiSearch />
                </InputGroup.Text>
                <FormControl
                  placeholder="Search contributions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Verified">Verified</option>
                <option value="Rejected">Rejected</option>
              </Form.Select>
            </Col>
            <Col md={5} className="text-end">
              <ButtonGroup>
                {isAdmin && (
                  <>
                    <Button
                      variant="primary"
                      onClick={() => setShowAddModal(true)}
                    >
                      <FiPlus className="me-2" />
                      Add Contribution
                    </Button>
                    <Button
                      variant="outline-primary"
                      onClick={() => setShowBulkModal(true)}
                    >
                      Bulk Add
                    </Button>
                  </>
                )}
                <Dropdown>
                  <Dropdown.Toggle variant="outline-secondary">
                    <FiDownload className="me-2" />
                    Export
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => downloadPDF('all')}>
                      Download All
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => downloadPDF('filtered')}>
                      Download Filtered
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </ButtonGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Contributions Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          {filteredContributions.length === 0 ? (
            <div className="text-center py-5">
              <FiDollarSign size={48} className="text-muted mb-3" />
              <h5 className="text-muted">No contributions found</h5>
              <p className="text-muted">
                {contributions.length === 0 
                  ? "No contributions have been recorded yet."
                  : "No contributions match your current filters."
                }
              </p>
              {isAdmin && contributions.length === 0 && (
                <Button
                  variant="primary"
                  onClick={() => setShowAddModal(true)}
                  className="mt-3"
                >
                  <FiPlus className="me-2" />
                  Record First Contribution
                </Button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Member</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Reference</th>
                    <th>Status</th>
                    {isAdmin && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredContributions.map(contribution => (
                    <tr key={contribution.id}>
                      <td>{new Date(contribution.date).toLocaleDateString()}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FiUser className="me-2 text-muted" />
                          {contribution.memberName}
                        </div>
                      </td>
                      <td>{contribution.type}</td>
                      <td className="fw-bold">
                        Ksh {contribution.amount.toLocaleString()}
                      </td>
                      <td>{contribution.paymentMethod}</td>
                      <td>
                        <code className="text-muted">{contribution.reference}</code>
                      </td>
                      <td>
                        <Badge bg={statusVariant(contribution.status)}>
                          {contribution.status}
                        </Badge>
                      </td>
                      {isAdmin && (
                        <td>
                          <ButtonGroup size="sm">
                            {contribution.status === 'Pending' && (
                              <>
                                <Button
                                  variant="outline-success"
                                  onClick={() => handleStatusChange(contribution.id, 'Verified')}
                                  title="Verify"
                                >
                                  <FiCheck />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  onClick={() => handleStatusChange(contribution.id, 'Rejected')}
                                  title="Reject"
                                >
                                  <FiXCircle />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="outline-secondary"
                              onClick={() => {
                                setReceiptData(contribution);
                                setShowReceiptModal(true);
                              }}
                              title="View Receipt"
                            >
                              <FiPrinter />
                            </Button>
                          </ButtonGroup>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add Contribution Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Record New Contribution</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Member *</Form.Label>
                  <Form.Select
                    value={formData.memberId}
                    onChange={(e) => handleMemberSelect(e.target.value)}
                    required
                  >
                    <option value="">Select Member</option>
                    {members.map(member => (
                      <option key={member.id || member.docId} value={member.id || member.docId}>
                        {member.name || 'Unknown Member'} {member.email && `(${member.email})`}
                      </option>
                    ))}
                  </Form.Select>
                  {members.length === 0 && (
                    <Form.Text className="text-muted">
                      No members found. Please check your chama setup.
                    </Form.Text>
                  )}
                  {process.env.NODE_ENV === 'development' && (
                    <Form.Text className="text-info">
                      Debug: {members.length} members loaded
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Contribution Type</Form.Label>
                  <Form.Select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Special">Special</option>
                    <option value="Fine">Fine</option>
                    <option value="Loan Repayment">Loan Repayment</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Amount (Ksh) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Payment Method</Form.Label>
                  <Form.Select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                  >
                    <option value="M-Pesa">M-Pesa</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Airtel Money">Airtel Money</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Reference Number *</Form.Label>
                  <Form.Control
                    type="text"
                    name="reference"
                    value={formData.reference}
                    onChange={handleInputChange}
                    placeholder="e.g., M-Pesa transaction code"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Verified">Verified</option>
                    <option value="Rejected">Rejected</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Optional notes..."
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddContribution}
            disabled={loading || !formData.memberId || !formData.amount || !formData.reference}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Recording...
              </>
            ) : (
              <>
                <FiPlus className="me-2" />
                Record Contribution
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bulk Contributions Modal */}
      <Modal show={showBulkModal} onHide={() => setShowBulkModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Bulk Record Contributions</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form>
            <Row className="mb-4">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Contribution Type</Form.Label>
                  <Form.Select
                    name="type"
                    value={bulkFormData.type}
                    onChange={handleBulkInputChange}
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Special">Special</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={bulkFormData.date}
                    onChange={handleBulkInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Payment Method</Form.Label>
                  <Form.Select
                    name="paymentMethod"
                    value={bulkFormData.paymentMethod}
                    onChange={handleBulkInputChange}
                  >
                    <option value="M-Pesa">M-Pesa</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Add Member</Form.Label>
                  <Form.Select
                    onChange={(e) => {
                      if (e.target.value) {
                        addMemberToBulkList(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  >
                    <option value="">Select Member to Add</option>
                    {members.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {bulkFormData.contributions.length > 0 && (
              <div className="table-responsive">
                <Table>
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Amount (Ksh)</th>
                      <th>Reference</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkFormData.contributions.map((contrib, index) => (
                      <tr key={index}>
                        <td>{contrib.memberName}</td>
                        <td>
                          <Form.Control
                            type="number"
                            value={contrib.amount}
                            onChange={(e) => updateBulkContribution(index, 'amount', e.target.value)}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="text"
                            value={contrib.reference}
                            onChange={(e) => updateBulkContribution(index, 'reference', e.target.value)}
                            placeholder="Reference number"
                          />
                        </td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeFromBulkList(index)}
                          >
                            <FiTrash2 />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBulkModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleBulkContributions}
            disabled={loading || bulkFormData.contributions.length === 0}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Recording...
              </>
            ) : (
              <>
                <FiPlus className="me-2" />
                Record {bulkFormData.contributions.length} Contributions
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Receipt Modal */}
      <Modal show={showReceiptModal} onHide={() => setShowReceiptModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Contribution Receipt</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {receiptData && (
            <div className="text-center">
              <h5 className="mb-3">{activeChama.name}</h5>
              <div className="mb-4">
                <p className="mb-1"><strong>Receipt #:</strong> {receiptData.reference}</p>
                <p className="mb-1"><strong>Date:</strong> {new Date(receiptData.date).toLocaleDateString()}</p>
                <p className="mb-1"><strong>Member:</strong> {receiptData.memberName}</p>
              </div>
              
              <div className="border-top border-bottom py-3 mb-4">
                <h6>Contribution Details</h6>
                <p className="mb-1"><strong>Type:</strong> {receiptData.type}</p>
                <p className="mb-1"><strong>Amount:</strong> Ksh {receiptData.amount.toLocaleString()}</p>
                <p className="mb-1"><strong>Payment Method:</strong> {receiptData.paymentMethod}</p>
                {receiptData.notes && (
                  <p className="mb-1"><strong>Notes:</strong> {receiptData.notes}</p>
                )}
              </div>
              
              <p className="text-muted small">Thank you for your contribution!</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={printReceipt}>
            <FiPrinter className="me-2" />
            Print
          </Button>
          <Button variant="primary" onClick={downloadReceipt}>
            <FiDownload className="me-2" />
            Download PDF
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Contributions;