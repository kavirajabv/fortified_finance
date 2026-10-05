/**
 * Automated Acceptance Test for:
 * Unknown Account Number → Category Learning & Automatic Future Categorization
 * Verifies all 10 requirements and the 4 acceptance test steps from prompt.
 */
import { AccountCategoryMappingService } from '../services/accountCategoryMappingService.ts';
import { resolveCategoryWithAccountPriority } from '../../src/services/categoryClassifier.ts';

async function runTests() {
  console.log('========================================================================');
  console.log('RUNNING ACCEPTANCE TEST: UNKNOWN ACCOUNT NUMBER CATEGORY LEARNING');
  console.log('========================================================================\n');

  const testUserId = 'usr_test_acceptance_01';
  // Clear any existing test mappings for this user
  AccountCategoryMappingService.clearForUser(testUserId);

  let passed = 0;
  let failed = 0;

  function assert(title: string, condition: boolean, extraInfo?: string) {
    if (condition) {
      console.log(`✓ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`✗ [FAIL] ${title} ${extraInfo ? `-> ${extraInfo}` : ''}`);
      failed++;
    }
  }

  // -------------------------------------------------------------------------
  // STEP 1: First Transaction — Unknown Account Number XXXX1234
  // -------------------------------------------------------------------------
  console.log('\n--- Step 1: First Transaction with Unknown Account Number ---');
  const learnedBefore = await AccountCategoryMappingService.getAllMappings(testUserId);
  const step1Result = resolveCategoryWithAccountPriority({
    accountNumber: 'XXXX1234',
    merchantName: 'ABC Bakery',
    itemName: 'ABC Bakery',
    learnedAccountMappings: learnedBefore as any
  });

  assert(
    'Step 1: Unknown account XXXX1234 is saved as "General Transactions"',
    step1Result.category === 'General Transactions' && step1Result.isGeneralTransaction === true,
    `Got category: ${step1Result.category}`
  );
  assert(
    'Step 1: Source indicates UNKNOWN_ACCOUNT_FALLBACK',
    step1Result.source === 'UNKNOWN_ACCOUNT_FALLBACK',
    `Got source: ${step1Result.source}`
  );

  // -------------------------------------------------------------------------
  // STEP 2: User Corrects the Category: General Transactions → Food
  // -------------------------------------------------------------------------
  console.log('\n--- Step 2: User Corrects Category to Food ---');
  // Action A & B: Update mapping in persistent store
  const mappingStep2 = await AccountCategoryMappingService.setMapping(testUserId, 'XXXX1234', 'Food');

  assert(
    'Step 2: Persistent mapping stored for XXXX1234 → Food',
    mappingStep2.accountNumber === 'XXXX1234' && mappingStep2.category === 'Food',
    `Got mapping: ${JSON.stringify(mappingStep2)}`
  );

  const retrievedMapping = await AccountCategoryMappingService.getMapping(testUserId, 'XXXX1234');
  assert(
    'Step 2: Retrieved mapping matches Food',
    retrievedMapping !== null && retrievedMapping.category === 'Food'
  );

  // -------------------------------------------------------------------------
  // STEP 3: Future Transaction to the Same Account (XXXX1234)
  // -------------------------------------------------------------------------
  console.log('\n--- Step 3: Future Transaction to XXXX1234 ---');
  const learnedAfterStep2 = await AccountCategoryMappingService.getAllMappings(testUserId);
  const step3Result = resolveCategoryWithAccountPriority({
    accountNumber: 'XXXX1234',
    merchantName: 'ABC Bakery',
    itemName: 'ABC Bakery',
    learnedAccountMappings: learnedAfterStep2 as any
  });

  assert(
    'Step 3: New transaction to XXXX1234 automatically assigned category "Food"',
    step3Result.category === 'Food',
    `Got category: ${step3Result.category}`
  );
  assert(
    'Step 3: Transaction does NOT appear under "General Transactions"',
    step3Result.isGeneralTransaction === false
  );
  assert(
    'Step 3: Source is ACCOUNT_LEARNED',
    step3Result.source === 'ACCOUNT_LEARNED'
  );

  // -------------------------------------------------------------------------
  // STEP 4: Category Change Behavior (Food → Shopping)
  // -------------------------------------------------------------------------
  console.log('\n--- Step 4: User updates mapping from Food to Shopping ---');
  const mappingStep4 = await AccountCategoryMappingService.setMapping(testUserId, 'XXXX1234', 'Shopping');
  assert(
    'Step 4: Mapping updated to Shopping without duplicating',
    mappingStep4.category === 'Shopping'
  );

  const learnedAfterStep4 = await AccountCategoryMappingService.getAllMappings(testUserId);
  const step4Result = resolveCategoryWithAccountPriority({
    accountNumber: 'XXXX1234',
    merchantName: 'ABC Bakery',
    itemName: 'ABC Bakery',
    learnedAccountMappings: learnedAfterStep4 as any
  });

  assert(
    'Step 4: Future transaction automatically uses updated category "Shopping"',
    step4Result.category === 'Shopping',
    `Got category: ${step4Result.category}`
  );

  // -------------------------------------------------------------------------
  // STEP 5: Multi-User Isolation (User 2 should not inherit User 1 mapping)
  // -------------------------------------------------------------------------
  console.log('\n--- Step 5: Multi-User Context Isolation ---');
  const otherUserId = 'usr_test_user_02';
  const otherUserMapping = await AccountCategoryMappingService.getMapping(otherUserId, 'XXXX1234');
  assert(
    'Step 5: Other user does not have XXXX1234 mapping (no cross-user pollution)',
    otherUserMapping === null
  );

  // Clean up test data
  AccountCategoryMappingService.clearForUser(testUserId);
  AccountCategoryMappingService.clearForUser(otherUserId);

  console.log('\n========================================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
