$('div.item input').on('change', function () {
  $(this).parent('div').fadeOut(800);
  setTimeout(()=>{this.form.submit();}, 800);
})
var myModal = document.getElementById('todoModal')
var myInput = document.getElementById('todoInput')
