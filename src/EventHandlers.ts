/*
 *Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features*
 */
import {
  SoundCreatorV2Contract_Created_loader,
  SoundCreatorV2Contract_Created_handler,
  SoundEditionContract_Transfer_handler,
  SoundEditionContract_Transfer_loader
} from '../generated/src/Handlers.gen';

import {
  SoundCreatorV2_CreatedEntity,
  SoundEdition_TransferEntity,
  EventsSummaryEntity
} from '../generated/src/Types.gen';

export const GLOBAL_EVENTS_SUMMARY_KEY = 'GlobalEventsSummary';

const INITIAL_EVENTS_SUMMARY: EventsSummaryEntity = {
  id: GLOBAL_EVENTS_SUMMARY_KEY,
  soundCreatorV2_CreatedCount: BigInt(0),
  soundEdition_TransferCount: BigInt(0)
};

SoundCreatorV2Contract_Created_loader(({ event, context }) => {
  context.EventsSummary.load(GLOBAL_EVENTS_SUMMARY_KEY);
  context.log.debug(`Contract: ${event.params.contracts[0]}`);
  context.contractRegistration.addSoundEdition(event.params.contracts[0]);
});

SoundCreatorV2Contract_Created_handler(({ event, context }) => {
  const summary = context.EventsSummary.get(GLOBAL_EVENTS_SUMMARY_KEY);

  const currentSummaryEntity: EventsSummaryEntity = summary ?? INITIAL_EVENTS_SUMMARY;

  const nextSummaryEntity = {
    ...currentSummaryEntity,
    soundCreatorV2_CreatedCount: currentSummaryEntity.soundCreatorV2_CreatedCount + BigInt(1)
  };

  const soundCreatorV2_CreatedEntity: SoundCreatorV2_CreatedEntity = {
    id: event.transactionHash + event.logIndex.toString(),
    implementation: event.params.implementation,
    edition: event.params.edition,
    owner: event.params.owner,
    initData: event.params.initData,
    contracts: event.params.contracts,
    data: event.params.data,
    results: event.params.results,
    eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY
  };

  context.EventsSummary.set(nextSummaryEntity);
  context.SoundCreatorV2_Created.set(soundCreatorV2_CreatedEntity);
});
SoundEditionContract_Transfer_loader(({ event, context }) => {
  context.log.debug(`Loading transfer event: ${JSON.stringify(event)}`);
  context.EventsSummary.load(GLOBAL_EVENTS_SUMMARY_KEY);
});

SoundEditionContract_Transfer_handler(({ event, context }) => {
  const summary = context.EventsSummary.get(GLOBAL_EVENTS_SUMMARY_KEY);
  context.log.debug(`${event.params.tokenId.toString()}`);
  const currentSummaryEntity: EventsSummaryEntity = summary ?? INITIAL_EVENTS_SUMMARY;

  const nextSummaryEntity = {
    ...currentSummaryEntity,
    soundEdition_MintedCount: currentSummaryEntity.soundEdition_TransferCount + BigInt(1)
  };

  const soundEdition_TransferEntity: SoundEdition_TransferEntity = {
    id: event.transactionHash + event.logIndex.toString(),
    from: event.params.from,
    to: event.params.to,
    tokenId: event.params.tokenId,
    eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY
  };

  context.EventsSummary.set(nextSummaryEntity);
  context.SoundEdition_Transfer.set(soundEdition_TransferEntity);
});
