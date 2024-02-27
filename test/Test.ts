import assert = require("assert")
import { MockDb, SoundCreatorV2 } from "../generated/src/TestHelpers.gen";
import {
  EventsSummaryEntity,
  SoundCreatorV2_CreatedEntity,
} from "../generated/src/Types.gen";

import { Addresses } from "../generated/src/bindings/Ethers.bs";

import { GLOBAL_EVENTS_SUMMARY_KEY } from "../src/EventHandlers";


const MOCK_EVENTS_SUMMARY_ENTITY: EventsSummaryEntity = {
  id: GLOBAL_EVENTS_SUMMARY_KEY,
  soundCreatorV2_CreatedCount: BigInt(0),
  soundEdition_MintedCount: BigInt(0),
};

describe("SoundCreatorV2 contract Created event tests", () => {
  // Create mock db
  const mockDbInitial = MockDb.createMockDb();

  // Add mock EventsSummaryEntity to mock db
  const mockDbFinal = mockDbInitial.entities.EventsSummary.set(
    MOCK_EVENTS_SUMMARY_ENTITY
  );

  // Creating mock SoundCreatorV2 contract Created event
  const mockSoundCreatorV2CreatedEvent = SoundCreatorV2.Created.createMockEvent({
    implementation: Addresses.defaultAddress,
    edition: Addresses.defaultAddress,
    owner: Addresses.defaultAddress,
    initData: "foo",
    contracts: [],
    data: [],
    results: [],
    mockEventData: {
      chainId: 1,
      blockNumber: 0,
      blockTimestamp: 0,
      blockHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
      srcAddress: Addresses.defaultAddress,
      transactionHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
      transactionIndex: 0,
      logIndex: 0,
    },
  });

  // Processing the event
  const mockDbUpdated = SoundCreatorV2.Created.processEvent({
    event: mockSoundCreatorV2CreatedEvent,
    mockDb: mockDbFinal,
  });

  it("SoundCreatorV2_CreatedEntity is created correctly", () => {
    // Getting the actual entity from the mock database
    let actualSoundCreatorV2CreatedEntity = mockDbUpdated.entities.SoundCreatorV2_Created.get(
      mockSoundCreatorV2CreatedEvent.transactionHash +
        mockSoundCreatorV2CreatedEvent.logIndex.toString()
    );

    // Creating the expected entity
    const expectedSoundCreatorV2CreatedEntity: SoundCreatorV2_CreatedEntity = {
      id:
        mockSoundCreatorV2CreatedEvent.transactionHash +
        mockSoundCreatorV2CreatedEvent.logIndex.toString(),
      implementation: mockSoundCreatorV2CreatedEvent.params.implementation,
      edition: mockSoundCreatorV2CreatedEvent.params.edition,
      owner: mockSoundCreatorV2CreatedEvent.params.owner,
      initData: mockSoundCreatorV2CreatedEvent.params.initData,
      contracts: mockSoundCreatorV2CreatedEvent.params.contracts,
      data: mockSoundCreatorV2CreatedEvent.params.data,
      results: mockSoundCreatorV2CreatedEvent.params.results,
      eventsSummary: "GlobalEventsSummary",
    };
    // Asserting that the entity in the mock database is the same as the expected entity
    assert.deepEqual(actualSoundCreatorV2CreatedEntity, expectedSoundCreatorV2CreatedEntity, "Actual SoundCreatorV2CreatedEntity should be the same as the expectedSoundCreatorV2CreatedEntity");
  });

  it("EventsSummaryEntity is updated correctly", () => {
    // Getting the actual entity from the mock database
    let actualEventsSummaryEntity = mockDbUpdated.entities.EventsSummary.get(
      GLOBAL_EVENTS_SUMMARY_KEY
    );

    // Creating the expected entity
    const expectedEventsSummaryEntity: EventsSummaryEntity = {
      ...MOCK_EVENTS_SUMMARY_ENTITY,
      soundCreatorV2_CreatedCount: MOCK_EVENTS_SUMMARY_ENTITY.soundCreatorV2_CreatedCount + BigInt(1),
    };
    // Asserting that the entity in the mock database is the same as the expected entity
    assert.deepEqual(actualEventsSummaryEntity, expectedEventsSummaryEntity, "Actual SoundCreatorV2CreatedEntity should be the same as the expectedSoundCreatorV2CreatedEntity");
  });
});
