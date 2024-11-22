<?php snippet("header") ?>

<h3><?= $page->author() ?>, <?= $page->date()->toDate("F Y") ?></h3>

<div class="text">
  <?= $page->text() ?>
</div>

<?php snippet("footer") ?>